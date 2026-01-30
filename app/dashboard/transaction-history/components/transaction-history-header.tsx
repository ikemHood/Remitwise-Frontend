"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ITransactionHistoryHeaderProps {
  transactions: string | number;
}

const TransactionHistoryHeader: React.FC<ITransactionHistoryHeaderProps> = ({
  transactions,
}) => {
  const router = useRouter();

  return (
    <div className="bg-[#010101F2] w-full flex justify-between items-center py-5 px-4 md:px-20 border-b border-b-[#FFFFFF14]">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => router.back()}
          type="button"
          className="bg-[#FFFFFF0D] p-2.5 sm:p-3 rounded-[14px] h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={17} className="text-white" />
        </button>
        <div className="min-w-0 md:w-full">
          <h5 className="font-bold text-xl sm:text-2xl leading-7 sm:leading-8 tracking-[0.07px] text-white">
            Transaction History
          </h5>
          <p className="font-normal text-xs sm:text-sm leading-5 tracking-[-0.15px] text-white/50">
            {transactions || "No"} transactions found
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Image
          src="/logo.svg"
          width={36}
          height={36}
          className="sm:w-10 sm:h-10"
          alt="Remitwise logo"
          priority
        />
        <p className="hidden md:block font-bold text-lg sm:text-xl leading-6 sm:leading-7 tracking-[-0.45px] text-white whitespace-nowrap">
          RemitWise
        </p>
      </div>
    </div>
  );
};

export default TransactionHistoryHeader;
