import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { customerApi, accountApi, transactionApi } from '../services/api';

interface Customer {
  customer_id: string;
  customer_name: string;
  customer_type: number;
  real_name_identification_number: string;
}

interface Account {
  account_number: string;
  customer_id: string;
  product_code: string;
  initial_deposit_amount: number;
  cash_amount: number;
  linked_substitute_amount: number;
  base_interest_rate: number;
  additional_interest_rate: number;
  applied_interest_rate: number;
}

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
  transaction_type: number;
  transaction_amount: number;
}

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionCreate>({
    account_number: '',
    transaction_type: 1,
    transaction_amount: 0,
  });

  // Load customers only once when component mounts
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await customerApi.getAll();
        setCustomers(response.data);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };
    loadCustomers();
  }, []); // Empty dependency array means this runs once on mount

  // Load accounts when customer is selected
  useEffect(() => {
    const loadAccounts = async () => {
      if (selectedCustomer) {
        try {
          const response = await accountApi.getAll();
          const customerAccounts = response.data.filter(
            (account: Account) => account.customer_id === selectedCustomer
          );
          setAccounts(customerAccounts);
        } catch (error) {
          console.error('Error loading accounts:', error);
        }
      }
    };
    loadAccounts();
  }, [selectedCustomer]);

  // Load transactions when account is selected
  useEffect(() => {
    const loadTransactions = async () => {
      if (selectedAccount) {
        try {
          const response = await accountApi.getTransactions(selectedAccount);
          // Sort transactions by date in descending order
          const sortedTransactions = response.data.sort((a: Transaction, b: Transaction) => 
            new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
          );
          setTransactions(sortedTransactions);
        } catch (error) {
          console.error('Error loading transactions:', error);
        }
      }
    };
    loadTransactions();
  }, [selectedAccount]);

  const handleCustomerChange = (event: any) => {
    const newCustomerId = event.target.value;
    setSelectedCustomer(newCustomerId);
    // Don't clear selected account immediately
    if (newCustomerId !== selectedCustomer) {
      setSelectedAccount('');
    }
  };

  const handleAccountChange = (event: any) => {
    setSelectedAccount(event.target.value);
  };

  const handleOpenTransactionDialog = () => {
    setTransactionData({
      account_number: selectedAccount,
      transaction_type: 1,
      transaction_amount: 0,
    });
    setOpenTransactionDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
  };

  const handleTransactionSubmit = async () => {
    try {
      console.log('Submitting transaction:', {
        ...transactionData,
        transaction_date: new Date().toISOString(),
      });
      
      const response = await transactionApi.create({
        ...transactionData,
        transaction_date: new Date().toISOString(),
      });
      
      console.log('Transaction response:', response);
      handleCloseTransactionDialog();
      
      // Reload transactions
      if (selectedAccount) {
        const response = await accountApi.getTransactions(selectedAccount);
        setTransactions(response.data);
      }
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
    }
  };

  // Save selected customer and account to localStorage
  useEffect(() => {
    if (selectedCustomer) {
      localStorage.setItem('selectedCustomer', selectedCustomer);
    }
    if (selectedAccount) {
      localStorage.setItem('selectedAccount', selectedAccount);
    }
  }, [selectedCustomer, selectedAccount]);

  // Load saved selections from localStorage on component mount
  useEffect(() => {
    const savedCustomer = localStorage.getItem('selectedCustomer');
    const savedAccount = localStorage.getItem('selectedAccount');
    
    if (savedCustomer) {
      setSelectedCustomer(savedCustomer);
    }
    if (savedAccount) {
      setSelectedAccount(savedAccount);
    }
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        대시보드
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Customer Selection */}
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>고객 선택</InputLabel>
                <Select
                  value={selectedCustomer}
                  label="고객 선택"
                  onChange={handleCustomerChange}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.customer_name} ({customer.customer_type === 1 ? '개인' : '법인'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Box>

        {/* Account Selection */}
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>계좌 선택</InputLabel>
                <Select
                  value={selectedAccount}
                  label="계좌 선택"
                  onChange={handleAccountChange}
                  disabled={!selectedCustomer}
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.account_number} value={account.account_number}>
                      {account.account_number} - {account.initial_deposit_amount.toLocaleString()}원
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Box>

        {/* Account Details */}
        {selectedAccount && (
          <Box sx={{ width: '100%' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  계좌 상세 정보
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {accounts
                    .filter((account) => account.account_number === selectedAccount)
                    .map((account) => (
                      <React.Fragment key={account.account_number}>
                        <Box sx={{ flex: '1 1 300px' }}>
                          <Typography variant="subtitle2">현금 잔액</Typography>
                          <Typography variant="h6">
                            {account.cash_amount.toLocaleString()}원
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 300px' }}>
                          <Typography variant="subtitle2">연계 대체 잔액</Typography>
                          <Typography variant="h6">
                            {account.linked_substitute_amount.toLocaleString()}원
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 300px' }}>
                          <Typography variant="subtitle2">적용 금리</Typography>
                          <Typography variant="h6">{account.applied_interest_rate}%</Typography>
                        </Box>
                      </React.Fragment>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Transaction History */}
        {selectedAccount && (
          <Box sx={{ width: '100%' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  거래 내역
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>거래일시</TableCell>
                        <TableCell>거래유형</TableCell>
                        <TableCell align="right">거래금액</TableCell>
                        <TableCell align="right">잔액</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            거래 내역이 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...transactions]
                          .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
                          .map((transaction) => (
                            <TableRow key={transaction.transaction_id}>
                              <TableCell>
                                {new Date(transaction.transaction_date).toLocaleString()}
                              </TableCell>
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
          </Box>
        )}
      </Box>

      {/* Transaction Dialog */}
      <Dialog open={openTransactionDialog} onClose={handleCloseTransactionDialog}>
        <DialogTitle>거래 추가</DialogTitle>
        <DialogContent>
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
            type="number"
            fullWidth
            value={transactionData.transaction_amount}
            onChange={(e) => setTransactionData({
              ...transactionData,
              transaction_amount: Number(e.target.value)
            })}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog}>취소</Button>
          <Button
            onClick={handleTransactionSubmit}
            variant="contained"
            color="primary"
            disabled={transactionData.transaction_amount <= 0}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 