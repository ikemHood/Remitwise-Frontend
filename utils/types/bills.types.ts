interface Bill {
    id: string;
    title: string;
    category: string;
    amount: number;
    dueDate: string;
    daysInfo: string;
    status: 'overdue' | 'urgent' | 'upcoming' | 'paid';
    isRecurring?: boolean;
}