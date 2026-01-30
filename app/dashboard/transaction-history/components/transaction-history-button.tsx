"use client";

interface ITransactionHistoryButtonProps {
  text: string;
  onclick?: () => void;
  icon: React.ReactNode;
}

const Button: React.FC<ITransactionHistoryButtonProps> = ({
  text,
  icon,
  onclick,
}) => {
  return (
    <button
      type="button"
      className="bg-white/5 border border-[#FFFFFF14] rounded-[14px] p-3 flex justify-center items-center gap-2 flex-1 sm:flex-none w-full sm:w-fit sm:min-w-[125.15px]"
      onClick={onclick}
    >
      {icon}
      <p className="text-white font-semibold text-base leading-6 tracking-[-0.31px] text-center">
        {text}
      </p>
    </button>
  );
};

export default Button;
