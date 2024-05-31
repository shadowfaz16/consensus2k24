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

//   const ApiServices = async () => {
//     const client = new CovalentClient("cqt_rQJQcxMbk6yHpHYCRhVcXV4kvfwd");
//     try {
//         const transactions = [];
//         for await (const resp of client.TransactionService.getAllTransactionsForAddress("eth-sepolia", user_wallet as string, {"noLogs": true,"blockSignedAtAsc": false})) {
//             transactions.push(resp);
//         }
//         setTransactionData(transactions); // Update the state with the fetched transactions
//     } catch (error) {
//         console.log(error);
//     }
// }

// console.log("transactionData", transactionData);

// useEffect(() => {
//     if (user_wallet) {
//         ApiServices();
//     }
// }
// , [user_wallet]);

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
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="hidden sm:table-cell">Token ID</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-accent">
              <TableCell>
                <div className="font-medium">NFT 1</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  Consensus NFTs
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">0</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant="secondary">
                  Complete
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">2023-06-23</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium">NFT 2</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  Consensus NFTs
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">1</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant="outline">
                  Complete
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">2023-06-24</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium">NFT 3</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  Consensus NFTs
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                2
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant="secondary">
                  Complete
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">2023-06-25</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium">NFT 4</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  Consensus NFTs
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">3</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant="secondary">
                  Complete
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">2023-06-26</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium">NFT 5</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  Consensus NFTs
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">4</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant="secondary">
                  Complete
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">2023-06-23</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  )
}
