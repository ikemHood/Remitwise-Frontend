"use client";
import TransactionHistoryHeader from "./components/transaction-history-header";
import TransactionHistorySearchInput from "./components/transaction-history-search-input";
import Button from "./components/transaction-history-button";
import { Download, FilterIcon } from "lucide-react";

const TransactionHistoryPage = () => {
  const handleFilterClick = () => {
    alert("Filter Button Clicked");
  };

  const handleExportClick = () => {
    alert("Export Button Clicked");
  };

  return (
    <main className="w-full min-h-screen bg-[#010101] font-inter">
      <TransactionHistoryHeader transactions={10} />
      <div className="mx-4 md:mx-20 mt-10">
        <div className="flex flex-col sm:flex-row justify-center gap-0 sm:gap-4 items-center border border-[#FFFFFF14] bg-gradient-to-b from-[#0F0F0F] to-[#0A0A0A] rounded-2xl py-6 px-4">
          <TransactionHistorySearchInput />
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <Button
              icon={<FilterIcon size={17} className="text-white" />}
              text="Filters"
              onclick={handleFilterClick}
            />
            <Button
              icon={<Download size={17} className="text-white" />}
              text="Export"
              onclick={handleExportClick}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default TransactionHistoryPage;
