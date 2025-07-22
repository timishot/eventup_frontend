import React, {use} from 'react'
import PollForm from "@/components/shared/PollForm";

type PollProps = {
    params: Promise<{ id: string }>;
};

const Poll = ({ params }: PollProps) => {
    const { id } = use(params)

    return (
        <PollForm eventId={id} />
    )
}
export default Poll
