export type Account = {
  id: string;
  name: string;
  type: string;
  initial_balance: number;
};

export type Category = {
  id: string;
  name: string;
  kind: "income" | "expense";
  color: string | null;
};

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  occurred_on: string;
  category_id: string;
  account_id: string;
  note: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  counts_toward_balance: boolean;
};

export type TransactionWithRelations = Transaction & {
  categories: Pick<Category, "name" | "color"> | null;
  accounts: Pick<Account, "name"> | null;
};

export type DebtKind = "persona" | "tarjeta" | "banco" | "otro";

export type Debt = {
  id: string;
  name: string;
  lender: string | null;
  kind: DebtKind;
  current_balance: number;
  interest_rate: number | null;
  reminder_day: number | null;
  status: "active" | "archived";
};

export type DebtMovement = {
  id: string;
  debt_id: string;
  type: "advance" | "payment";
  amount: number;
  occurred_on: string;
  note: string | null;
  counts_toward_balance: boolean;
  created_at: string;
};
