interface Props {
    onClick: () => void
    children: React.ReactNode
}

const Button = (props: Props) => {
    const { onClick } = props
    return (
        <button
            className="bg-black text-white p-2 rounded border-2"
            onClick={onClick}
        >
            {props.children}
        </button>
    )
}

export default Button