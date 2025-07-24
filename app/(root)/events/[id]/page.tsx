'use client'

import { useEffect, useState, useRef, use } from "react";
import Image from "next/image";
import { formatDateTime, getAccessToken } from "@/lib/utils";
import { IEvent } from "@/types";
import Collection from "@/components/shared/Collection";
import { useSearchParams } from "next/navigation";
import CheckoutButton from "@/components/shared/CheckoutButton";
import { Button } from "@/components/ui/button";
import { GetEventById } from "@/lib/actions/get/event";
import { getRelatedEvents } from "@/lib/actions/event";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

interface Poll {
    id: string;
    text: string;
    choices: { id: string; text: string; votes: number }[];
}

interface Question {
    id: string;
    text: string;
    answers: { id: string; text: string; user: { username: string } }[];
}

type EventDetailsProps = {
    params: Promise<{ id: string }>;
};

const EventDetails = ({ params }: EventDetailsProps) => {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const page = searchParams.get("page") || "1";

    const [event, setEvent] = useState<IEvent | null>(null);
    const [relatedEvents, setRelatedEvents] = useState<any>(null);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [answerInput, setAnswerInput] = useState<{ [key: string]: string }>({});
    const [wsError, setWsError] = useState<string | null>(null);
    const [isCreator, setIsCreator] = useState<boolean>(false);
    const [userVotes, setUserVotes] = useState<{ [pollId: string]: string }>({});
    const pendingVotes = useRef<Set<string>>(new Set());

    useEffect(() => {
        const fetchEventAndPollsAndQuestions = async () => {
            try {
                const data = await GetEventById(id);
                setEvent(data);
                const tokenData = await getAccessToken();

                setAccessToken(tokenData.accessToken);


                // Fetch polls
                const pollsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/polls/${id}/polls/`, {
                    headers: {
                        'Authorization': `Bearer ${tokenData.accessToken}`,
                    },
                });
                if (!pollsResponse.ok) {
                    throw new Error(`Failed to fetch polls: ${pollsResponse.status} ${pollsResponse.statusText}`);
                }
                const pollsData = await pollsResponse.json();
                console.log('Fetched polls:', JSON.stringify(pollsData, null, 2));
                setPolls(pollsData);

                // Fetch questions
                const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qns/${id}/questions/`, {
                    headers: {
                        'Authorization': `Bearer ${tokenData.accessToken}`,
                    },
                });
                if (!questionsResponse.ok) {
                    throw new Error(`Failed to fetch questions: ${questionsResponse.status} ${questionsResponse.statusText}`);
                }
                const questionsData = await questionsResponse.json();
                console.log('Fetched questions:', JSON.stringify(questionsData, null, 2));
                setQuestions(questionsData.results || questionsData);

                // Fetch user votes
                if (tokenData.accessToken) {
                    const votesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/polls/user-votes/`, {
                        headers: {
                            'Authorization': `Bearer ${tokenData.accessToken}`,
                        },
                    });
                    if (!votesResponse.ok) {
                        throw new Error(`Failed to fetch user votes: ${votesResponse.status}`);
                    }
                    const votesData = await votesResponse.json();
                    console.log('Fetched user votes:', JSON.stringify(votesData, null, 2));
                    const votesMap = votesData.reduce((acc: { [key: string]: string }, vote: any) => {
                        acc[vote.question_id] = vote.choice_id;
                        return acc;
                    }, {});
                    setUserVotes(votesMap);
                }
            } catch (error: any) {
                console.error("Failed to fetch event, polls, questions, or votes:", error);
                toast.error(`Failed to load event details, polls, questions, or votes: ${error.message}`);
            }
        };
        fetchEventAndPollsAndQuestions();
    }, [id]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/status');
                const data = await res.json();
                setIsCreator(data.userId == event?.organizer?.id);
                console.log("Auth status:", data);
            } catch (error) {
                console.error("Failed to fetch auth status:", error);
            }
        };

        checkAuth();
    }, [event]);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!event) return;
            try {
                const category = event.category?.id || "";
                const data = await getRelatedEvents({
                    category,
                    eventId: event.id,
                    page,
                    limit: 6
                });
                setRelatedEvents(data);
            } catch (error: any) {
                console.error("Failed to fetch related events:", error);
                toast.error(`Failed to fetch related events: ${error.message}`);
            }
        };
        fetchRelated();
    }, [event, page]);

    useEffect(() => {
        let socket: WebSocket | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const retryDelay = 5000;

        const connectWebSocket = async () => {
            if (reconnectAttempts >= maxReconnectAttempts) {
                setWsError("Max WebSocket reconnection attempts reached. Please refresh the page.");
                toast.error("Max WebSocket reconnection attempts reached. Please refresh the page.");
                return;
            }
            try {
                const tokenData = await getAccessToken();
                if (!tokenData.accessToken) {
                    setWsError("No authentication token found. Please log in.");
                    toast.error("No authentication token found. Please log in.");
                    return;
                }
                console.log("Connecting to WebSocket with token:", tokenData.accessToken);
                console.log("WebSocket URL:", `${process.env.NEXT_PUBLIC_WS_URL}/ws/event/${id}/?subscriptions=poll,qna&token=${tokenData.accessToken}`);
                socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/event/${id}/?subscriptions=poll,qna&token=${tokenData.accessToken}`);
                setWs(socket);

                socket.onopen = () => {
                    console.log("WebSocket connected");
                    setWsError(null);
                    reconnectAttempts = 0;
                    toast.success("Connected to live updates!");
                };

                socket.onmessage = (e) => {
                    console.log("WebSocket message received:", e.data);
                    const data = JSON.parse(e.data);
                    if (data.type === "error") {
                        console.error("WebSocket error:", data.error);
                        setWsError(`WebSocket error: ${data.error}`);
                        toast.error(`Error: ${data.error}`);
                        pendingVotes.current.delete(data.poll?.id || '');
                    } else if (data.type === "poll_update") {
                        setPolls((prev) => {
                            const updatedPolls = prev.filter(p => p.id !== data.poll.id);
                            return [...updatedPolls, data.poll];
                        });
                        if (pendingVotes.current.has(data.poll.id)) {
                            toast.success(userVotes[data.poll.id] ? "Vote changed successfully!" : "Vote recorded successfully!");
                            pendingVotes.current.delete(data.poll.id);
                        }
                    } else if (data.type === "qna_update") {
                        setQuestions((prev) => {
                            const updatedQuestions = prev.filter(q => q.id !== data.question.id);
                            return [...updatedQuestions, data.question];
                        });
                        toast.success("Answer submitted successfully!");
                    }
                };

                socket.onerror = (e) => {
                    console.error("WebSocket error:", e);
                    setWsError("WebSocket connection failed. Retrying...");
                    toast.error("WebSocket connection failed. Retrying...");
                };

                socket.onclose = (event) => {
                    console.log("WebSocket closed with code:", event.code, "reason:", event.reason || "No reason provided");
                    setWsError(`WebSocket disconnected (code: ${event.code}). Retrying in ${retryDelay / 1000} seconds...`);
                    toast.error(`WebSocket disconnected (code: ${event.code}). Retrying...`);
                    setTimeout(() => {
                        reconnectAttempts++;
                        connectWebSocket();
                    }, retryDelay);
                };
            } catch (error: any) {
                console.error("Failed to connect WebSocket:", error);
                setWsError("Failed to establish WebSocket connection. Retrying...");
                toast.error(`Failed to establish WebSocket connection: ${error.message}`);
                setTimeout(() => {
                    reconnectAttempts++;
                    connectWebSocket();
                }, retryDelay);
            }
        };

        connectWebSocket();
        return () => {
            socket?.close();
        };
    }, [id]);

    const handleVote = async (questionId: string, choiceId: string) => {
        if (!accessToken) {
            console.error("No access token available");
            toast.error("Please log in to vote.");
            return;
        }
        if (!questionId || !choiceId) {
            console.error("Invalid vote payload:", { questionId, choiceId });
            toast.error("Invalid question or choice selected.");
            return;
        }
        if (userVotes[questionId] === choiceId) {
            console.warn("User already selected choice:", choiceId, "for poll:", questionId);
            toast.error("This choice is already selected.");
            return;
        }
        try {
            pendingVotes.current.add(questionId);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/polls/polls/${questionId}/vote/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ choice_id: choiceId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to vote: ${response.status}`);
            }
            const data = await response.json();
            console.log("Vote response:", JSON.stringify(data, null, 2));
            setPolls((prev) => {
                const updatedPolls = prev.filter(p => p.id !== data.id);
                return [...updatedPolls, data];
            });
            setUserVotes((prev) => ({ ...prev, [questionId]: choiceId }));
            toast.success(userVotes[questionId] ? "Vote changed successfully!" : "Vote recorded successfully!");
            pendingVotes.current.delete(questionId);
        } catch (error: any) {
            console.error("Failed to send vote:", error);
            toast.error(`Failed to submit vote: ${error.message}`);
            pendingVotes.current.delete(questionId);
        }
    };


    const handleAnswerSubmit = async (questionId: string) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket not connected:", ws?.readyState);
            toast.error("Cannot submit answer: WebSocket connection is not open.");
            return;
        }
        if (!accessToken) {
            console.error("No access token available");
            toast.error("Please log in to submit an answer.");
            return;
        }
        if (!answerInput[questionId]) {
            console.error("No answer provided for question:", questionId);
            toast.error("Please enter an answer.");
            return;
        }
        try {
            const payload = { action: "new_answer", question_id: questionId, text: answerInput[questionId] };
            console.log("Sending answer:", JSON.stringify(payload, null, 2));
            ws.send(JSON.stringify(payload));
            setAnswerInput((prev) => ({ ...prev, [questionId]: '' }));
            const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qns/${id}/questions/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (questionsResponse.ok) {
                const questionsData = await questionsResponse.json();
                console.log('Fetched questions after answer:', JSON.stringify(questionsData, null, 2));
                setQuestions(questionsData.results || questionsData);
            } else {
                throw new Error(`Failed to fetch questions: ${questionsResponse.status}`);
            }
        } catch (error: any) {
            console.error("Failed to send answer:", error);
            toast.error(`Failed to submit answer: ${error.message}`);
        }
    };

    if (wsError) {
        return (
            <section className="flex items-center justify-center h-[50vh]">
                <p className="text-lg font-semibold">{wsError}</p>
            </section>
        );
    }

    if (!event) {
        return (
            <section className="flex items-center justify-center h-[50vh]">
                <p className="text-lg font-semibold">Loading event...</p>
            </section>
        );
    }

    return (
        <>
            <section className="flex justify-center bg-primary-50 bg-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
                    <Image
                        src={event.imageUrl}
                        alt="hero Image"
                        width={1000}
                        height={1000}
                        className="h-full min-h-[300px] object-cover object-center"
                        priority
                    />
                    <div className="flex w-full flex-col gap-8 p-5 md:p-10">
                        <div className="flex flex-col gap-6">
                            <h2 className="font-bold text-[32px] leading-[40px] lg:text-[36px] lg:leading-[44px] xl:text-[40px] xl:leading-[48px]">{event.title}</h2>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex gap-3">
                                    <p className="font-bold text-[20px] leading-[30px] tracking-[2%] rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                                        {event.isFree ? 'Free' : `₦${event.price}`}
                                    </p>
                                    <p className="text-[16px] font-medium leading-[24px] rounded-full bg-gray-500/10 px-4 py-2.5 text-gray-500">
                                        {event.category?.name}
                                    </p>
                                </div>
                                <Link href={`/profile/${event.organizer?.id}`} className="cursor-pointer">
                                    <p className="text-[18px] font-medium leading-[28px] ml-2 mt-2 sm:mt-0">
                                        by <span className="text-blue-500">{event.organizer?.username}</span>
                                    </p>
                                </Link>
                            </div>
                        </div>

                        <CheckoutButton event={event}/>

                        <div className="flex flex-col gap-5">
                            <div className="flex gap-2 md:gap-3">
                                <Image
                                    src="/assets/icon/calendar.svg"
                                    alt="calendar"
                                    width={32}
                                    height={32}
                                    style={{width: 'auto', height: 'auto'}}
                                />
                                <div
                                    className="text-[16px] font-medium leading-[24px] md:text-[20px] md:font-normal md:leading-[30px] md:tracking-[2%] flex flex-wrap items-center gap-3">
                                    <p>{formatDateTime(event.startDateTime).dateOnly} - {formatDateTime(event.startDateTime).timeOnly}</p>
                                    <p>{formatDateTime(event.endDateTime).dateOnly} - {formatDateTime(event.endDateTime).timeOnly}</p>
                                </div>
                            </div>
                            <div
                                className="text-[20px] font-normal leading-[30px] tracking-[2%] flex items-center gap-3">
                                <Image
                                    src="/assets/icon/location.svg"
                                    alt="location"
                                    width={32}
                                    height={32}
                                    style={{width: 'auto', height: 'auto'}}
                                />
                                <p className="text-[16px] font-medium leading-[24px] lg:text-[20px] lg:font-normal lg:leading-[30px] lg:tracking-[2%]">{event.location}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="font-bold text-[20px] leading-[30px] tracking-[2%] text-gray-600">What You'll
                                Learn:</p>
                            <p className="text-[16px] font-medium leading-[24px] lg:text-[18px] lg:font-normal lg:leading-[28px] lg:tracking-[2%] truncate text-blue-500">{event.description}</p>
                            <p className="text-[16px] font-medium leading-[24px] lg:text-[18px] lg:font-normal lg:leading-[28px] lg:tracking-[2%] truncate text-blue-500 underline">{event.url}</p>
                        </div>

                        {isCreator && (
                            <div className="flex gap-4">
                                <Link href={`/events/${id}/poll`}>
                                    <Button className="rounded-full h-[54px] bg-blue-500 text-white">Create
                                        Poll</Button>
                                </Link>
                                <Link href={`/events/${id}/QnA`}>
                                    <Button className="rounded-full h-[54px] bg-blue-500 text-white">Create Q&A</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 py-10">
                <h3 className="text-2xl font-semibold mb-4">Live Polls</h3>
                {polls.length === 0 && <p>No polls yet.</p>}
                {polls.map((poll) => (
                    <div key={poll.id} className="mb-6">
                        <h4 className="font-semibold text-lg mb-2">{poll.text}</h4>
                        <ul className="space-y-2">
                            {poll.choices.map((opt) => (
                                <li
                                    key={opt.id}
                                    className={`flex justify-between bg-gray-100 rounded-lg px-4 py-2 ${
                                        userVotes[poll.id] === opt.id ? 'border-2 border-blue-500' : ''
                                    }`}
                                >
                                    <span>{opt.text}</span>
                                    <div className="flex gap-2 items-center">
                                        <span className="font-bold">{opt.votes}</span>
                                        {userVotes[poll.id] === opt.id ? (
                                            <span className="text-blue-500 font-semibold">Selected</span>
                                        ) : (
                                            <Button
                                                onClick={() => handleVote(poll.id, opt.id)}
                                                className="bg-blue-500 text-white rounded-full h-8"
                                                disabled={!accessToken || pendingVotes.current.has(poll.id)}
                                            >
                                                {userVotes[poll.id] ? "Change Vote" : "Vote"}
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            <section className="max-w-5xl mx-auto px-4 py-12">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Live Q&A</h3>
                {questions.length === 0 ? (
                    <p className="text-gray-500 text-lg">No questions yet.</p>
                ) : (
                    questions.map((q) => (
                        <div
                            key={q.id}
                            className="mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <p className="text-xl font-semibold text-gray-900 mb-3 leading-relaxed">
                                {q.text}
                            </p>
                            {q.answers?.length > 0 && (
                                <ul className="mt-4 pl-5 list-disc list-none text-gray-600 text-base">
                                    {q.answers.map((a) => (
                                        <li key={a.id} className="mb-2 border p-2 border-gray-300 rounded-md">
                                            {a.text}{' '}
                                            <span className="text-blue-600 font-medium">
                        — {a.user.username}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-4 flex gap-3">
                                <Input
                                    placeholder="Enter your answer"
                                    value={answerInput[q.id] || ''}
                                    onChange={(e) =>
                                        setAnswerInput((prev) => ({
                                            ...prev,
                                            [q.id]: e.target.value,
                                        }))
                                    }
                                    className="flex-1 bg-gray-100 border-none rounded-full px-5 py-2.5 text-gray-800 focus:ring-2 focus:ring-blue-300 transition"
                                />
                                <Button
                                    onClick={() => handleAnswerSubmit(q.id)}
                                    className="bg-blue-600 text-white rounded-full px-6 py-2.5 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                    disabled={!accessToken || !answerInput[q.id]}
                                >
                                    Submit Answer
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </section>



            <section className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full my-8 flex flex-col gap-8 md:gap-12">
                <h2 className="font-bold text-[32px] leading-[40px] lg:text-[36px] lg:leading-[44px] xl:text-[40px] xl:leading-[48px]">Related
                    Events</h2>
                <Collection
                    data={relatedEvents?.data || []}
                    emptyTitle="No Events Found"
                    emptyStateSubtext="Come back later"
                    collectionType="All_Events"
                    limit={3}
                    page={page}
                    totalPages={relatedEvents?.totalPages}
                />
            </section>
        </>
    );
};

export default EventDetails;
