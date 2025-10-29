const IconHistory = ({ className = "", fill = false, duotone = true }) => {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M12 8V12L14.5 14.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                opacity={duotone ? "0.5" : "1"}
                d="M3.27489 15H2.6C2.26863 15 2 14.7314 2 14.4V9.6C2 9.26863 2.26863 9 2.6 9H3.27489C3.41124 9 3.54017 8.92178 3.61029 8.80031C4.67549 6.91066 6.44471 5.4755 8.5 4.74454V3C8.5 2.44772 8.94772 2 9.5 2H14.5C15.0523 2 15.5 2.44772 15.5 3V4.74454C17.5553 5.4755 19.3245 6.91066 20.3897 8.80031C20.4598 8.92178 20.5888 9 20.7251 9H21.4C21.7314 9 22 9.26863 22 9.6V14.4C22 14.7314 21.7314 15 21.4 15H20.7251C20.5888 15 20.4598 15.0782 20.3897 15.1997C18.8819 17.8288 16.3742 19.5 13.5 19.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M13.5 19.5C13.5 19.5 8 19.5 8 22H3C3 22 3 19.5 8 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default IconHistory;
