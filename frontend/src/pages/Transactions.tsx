import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { transactionApi } from '../services/api';
import { accountApi } from '../services/api';

interface Transaction {
  transaction_id: number;
  account_number: string;
  transaction_date: string;
  transaction_type: number;
  transaction_amount: number;
  balance_after_transaction: number;
}

interface TransactionCreate {
  account_number: string;
  transaction_date: string;
  transaction_type: number;
  transaction_amount: number;
  balance_after_transaction: number;
}

interface Account {
  account_number: string;
  customer_id: string;
  product_code: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionCreate>({
    account_number: '',
    transaction_date: new Date().toISOString(),
    transaction_type: 1,
    transaction_amount: 0,
    balance_after_transaction: 0
  });

  useEffect(() => {
    loadTransactions();
    loadAccounts();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionApi.getAll();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await accountApi.getAll();
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      // 모든 필수 필드가 있는지 확인
      if (!transactionData.account_number || !transactionData.transaction_date || !transactionData.transaction_type || !transactionData.transaction_amount) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }

      // 거래 데이터 준비
      const submitData = {
        account_number: transactionData.account_number,
        transaction_date: new Date(transactionData.transaction_date).toISOString(),
        transaction_type: Number(transactionData.transaction_type),
        transaction_amount: Number(transactionData.transaction_amount),
        balance_after_transaction: Number(transactionData.transaction_amount) // 임시로 거래금액과 동일하게 설정
      };

      console.log('Submitting transaction:', submitData);
      const response = await transactionApi.create(submitData);
      console.log('Transaction created:', response.data);
      
      // 성공 시 초기화
      setTransactionData({
        account_number: '',
        transaction_date: new Date().toISOString(),
        transaction_type: 1,
        transaction_amount: 0,
        balance_after_transaction: 0
      });
      
      handleCloseDialog();
      loadTransactions();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      let errorMessage = '거래 생성 중 오류가 발생했습니다.';
      
      if (error.response) {
        const detail = error.response.data?.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (detail && typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          거래 내역
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          sx={{ minWidth: '120px' }}
        >
          거래 추가
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>거래일시</TableCell>
                  <TableCell>계좌번호</TableCell>
                  <TableCell>거래유형</TableCell>
                  <TableCell align="right">거래금액</TableCell>
                  <TableCell align="right">잔액</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      거래 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleString()}
                      </TableCell>
                      <TableCell>{transaction.account_number}</TableCell>
                      <TableCell>
                        {transaction.transaction_type === 1 ? '입금' : '출금'}
                      </TableCell>
                      <TableCell align="right">
                        {transaction.transaction_amount.toLocaleString()}원
                      </TableCell>
                      <TableCell align="right">
                        {transaction.balance_after_transaction.toLocaleString()}원
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>거래 추가</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>계좌번호</InputLabel>
            <Select
              value={transactionData.account_number}
              label="계좌번호"
              onChange={(e) => setTransactionData({
                ...transactionData,
                account_number: e.target.value
              })}
            >
              {accounts.map((account) => (
                <MenuItem key={account.account_number} value={account.account_number}>
                  {account.account_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="거래일시"
            type="datetime-local"
            fullWidth
            required
            value={transactionData.transaction_date.slice(0, 16)}
            onChange={(e) => setTransactionData({
              ...transactionData,
              transaction_date: new Date(e.target.value).toISOString()
            })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>거래 유형</InputLabel>
            <Select
              value={transactionData.transaction_type}
              label="거래 유형"
              onChange={(e) => setTransactionData({
                ...transactionData,
                transaction_type: Number(e.target.value)
              })}
            >
              <MenuItem value={1}>입금</MenuItem>
              <MenuItem value={2}>출금</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="거래 금액"
            fullWidth
            required
            value={transactionData.transaction_amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setTransactionData({
                ...transactionData,
                transaction_amount: value === '' ? 0 : parseInt(value, 10)
              });
            }}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!transactionData.account_number || transactionData.transaction_amount <= 0}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions; 