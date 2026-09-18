import { ReactNode } from "react"

interface Props {
    children: ReactNode
}

export default function Wrapper({ children }: Props) {
    return <div className="w-full px-4 sm:w-3/4 md:w-1/2 lg:w-1/3">{children}</div>
}