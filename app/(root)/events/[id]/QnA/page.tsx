import React, {use} from 'react'
import QnAForm from "@/components/shared/QnAForm";

type QnAProps = {
    params: Promise<{ id: string }>;
};

const QnA = ({ params }: QnAProps) => {
    const { id } = use(params)
    return (
        <QnAForm eventId={id} />
    )
}
export default QnA
