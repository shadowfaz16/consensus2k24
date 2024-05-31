import { Badge } from "@/components/ui/badge"
import { CovalentClient } from "@covalenthq/client-sdk";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { type Transaction } from "@covalenthq/client-sdk";

export default function Component() {
  const wallet = useActiveAccount();
  const user_wallet = wallet?.address;
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);

  const ApiServices = async () => {
    const client = new CovalentClient("cqt_rQJQcxMbk6yHpHYCRhVcXV4kvfwd");
    try {
        const transactions = [];
        for await (const resp of client.TransactionService.getAllTransactionsForAddress("eth-sepolia", user_wallet as string, {"noLogs": true,"blockSignedAtAsc": false})) {
            transactions.push(resp);
        }
        setTransactionData(transactions); // Update the state with the fetched transactions
    } catch (error) {
        console.log(error);
    }
}

console.log("transactionData", transactionData);

useEffect(() => {
    if (user_wallet) {
        ApiServices();
    }
}
, [user_wallet]);

  return (
    <>
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Txn History</CardTitle>
        <CardDescription>Here is your recent transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-accent">
              <TableHead>From</TableHead>
              <TableHead className="hidden sm:table-cell">To</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              transactionData.slice(0, 10).map((transaction, index) => {
                return (
            <TableRow className="">
              <TableCell>
                <div className="font-medium py-2">{transaction.from_address}</div>
                {/* <div className="hidden text-sm text-muted-foreground md:inline">
                  Consensus NFTs
                </div> */}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{transaction.to_address}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant="secondary">
                  {transaction.successful ? "Success" : "Failed"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{transaction.block_signed_at.toDateString()}</TableCell>
            </TableRow>
                )
              }
              )
            }
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  )
}
