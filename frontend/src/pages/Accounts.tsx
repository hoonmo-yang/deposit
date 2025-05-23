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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { accountApi, customerApi, productApi } from '../services/api';
import api from '../services/api';

interface Account {
  account_number: string;
  customer_id: string;
  product_code: string;
  real_name_identification_number: string;
  customer_type: number;
  taxation_code: string;
  initial_deposit_amount: number;
  passbook_exemption_flag: boolean;
  base_interest_rate: number;
  additional_interest_rate: number;
  applied_interest_rate: number;
  account_password: string;
  cash_amount: number;
  linked_substitute_amount: number;
  linked_substitute_account_number: string | null;
}

interface Customer {
  customer_id: string;
  customer_name: string;
  customer_type: number;
  real_name_identification_number: string;
}

interface Product {
  product_code: string;
  product_name: string;
  eligible_customer_type: number;
  taxation_code: string;
  eligible_age: number;
  base_interest_rate: number;
  additional_interest_rate: number;
  applied_interest_rate: number;
}

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    product_code: '',
    real_name_identification_number: '',
    customer_type: 1,
    taxation_code: '1',
    initial_deposit_amount: 0,
    passbook_exemption_flag: false,
    base_interest_rate: 0,
    additional_interest_rate: 0,
    applied_interest_rate: 0,
    account_password: '',
    cash_amount: 0,
    linked_substitute_amount: 0,
    linked_substitute_account_number: '',
  });

  const loadAccounts = async () => {
    try {
      const response = await accountApi.getAll();
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadCustomers();
    loadProducts();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      customer_id: '',
      product_code: '',
      real_name_identification_number: '',
      customer_type: 1,
      taxation_code: '1',
      initial_deposit_amount: 0,
      passbook_exemption_flag: false,
      base_interest_rate: 0,
      additional_interest_rate: 0,
      applied_interest_rate: 0,
      account_password: '',
      cash_amount: 0,
      linked_substitute_amount: 0,
      linked_substitute_account_number: '',
    });
  };

  const handleSubmit = async () => {
    try {
      // Calculate initial_deposit_amount
      const initialDepositAmount = formData.cash_amount + formData.linked_substitute_amount;
      
      const submitData = {
        ...formData,
        initial_deposit_amount: initialDepositAmount,
      };

      console.log('Form data before submission:', formData);
      console.log('Submit data:', submitData);
      console.log('API URL:', `${api.defaults.baseURL}/accounts/`);
      
      const response = await accountApi.create(submitData);
      console.log('API Response:', response);
      handleClose();
      loadAccounts();
    } catch (error: any) {
      console.error('Error creating account:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
        console.error('Request config:', error.config);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const handleDelete = async (accountNumber: string) => {
    if (window.confirm('정말로 이 계좌를 삭제하시겠습니까?')) {
      try {
        await accountApi.delete(accountNumber);
        loadAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.customer_id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customer_id: customerId,
        customer_type: customer.customer_type,
        real_name_identification_number: customer.real_name_identification_number,
      });
    }
  };

  const handleProductChange = (productCode: string) => {
    const product = products.find(p => p.product_code === productCode);
    if (product) {
      setFormData({
        ...formData,
        product_code: productCode,
        taxation_code: product.taxation_code,
        base_interest_rate: product.base_interest_rate,
        additional_interest_rate: product.additional_interest_rate,
        applied_interest_rate: product.applied_interest_rate,
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">계좌 관리</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          계좌 추가
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>계좌번호</TableCell>
              <TableCell>고객명</TableCell>
              <TableCell>상품명</TableCell>
              <TableCell>고객 유형</TableCell>
              <TableCell>과세 코드</TableCell>
              <TableCell>초기 입금액</TableCell>
              <TableCell>통장 면제</TableCell>
              <TableCell>기본 금리 (%)</TableCell>
              <TableCell>가산 금리 (%)</TableCell>
              <TableCell>적용 금리 (%)</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => {
              const customer = customers.find(c => c.customer_id === account.customer_id);
              const product = products.find(p => p.product_code === account.product_code);
              return (
                <TableRow key={account.account_number}>
                  <TableCell>{account.account_number}</TableCell>
                  <TableCell>{customer?.customer_name || account.customer_id}</TableCell>
                  <TableCell>{product?.product_name || account.product_code}</TableCell>
                  <TableCell>
                    {account.customer_type === 1 ? '개인' : '법인'}
                  </TableCell>
                  <TableCell>{account.taxation_code}</TableCell>
                  <TableCell>{account.initial_deposit_amount.toLocaleString()}원</TableCell>
                  <TableCell>{account.passbook_exemption_flag ? '예' : '아니오'}</TableCell>
                  <TableCell>{account.base_interest_rate}%</TableCell>
                  <TableCell>{account.additional_interest_rate}%</TableCell>
                  <TableCell>{account.applied_interest_rate}%</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(account.account_number)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>새 계좌 추가</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>고객</InputLabel>
            <Select
              value={formData.customer_id}
              label="고객"
              onChange={(e) => handleCustomerChange(e.target.value)}
              required
            >
              {customers.map((customer) => (
                <MenuItem key={customer.customer_id} value={customer.customer_id}>
                  {customer.customer_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>상품</InputLabel>
            <Select
              value={formData.product_code}
              label="상품"
              onChange={(e) => handleProductChange(e.target.value)}
              required
            >
              {products.map((product) => (
                <MenuItem key={product.product_code} value={product.product_code}>
                  {product.product_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="실명확인번호"
            fullWidth
            value={formData.real_name_identification_number}
            onChange={(e) => setFormData({ ...formData, real_name_identification_number: e.target.value })}
            inputProps={{ maxLength: 13 }}
            required
          />
          <TextField
            margin="dense"
            label="계좌 비밀번호"
            fullWidth
            value={formData.account_password}
            onChange={(e) => setFormData({ ...formData, account_password: e.target.value })}
            inputProps={{ maxLength: 4 }}
            required
          />
          <TextField
            margin="dense"
            label="현금 입금액"
            fullWidth
            value={formData.cash_amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData({
                ...formData,
                cash_amount: value === '' ? 0 : parseInt(value, 10)
              });
            }}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            required
          />
          <TextField
            margin="dense"
            label="연계 대체 입금액"
            fullWidth
            value={formData.linked_substitute_amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData({
                ...formData,
                linked_substitute_amount: value === '' ? 0 : parseInt(value, 10)
              });
            }}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            required
          />
          <TextField
            margin="dense"
            label="연계 대체 계좌번호"
            fullWidth
            value={formData.linked_substitute_account_number}
            onChange={(e) => setFormData({ ...formData, linked_substitute_account_number: e.target.value })}
            inputProps={{ maxLength: 10 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.passbook_exemption_flag}
                onChange={(e) => setFormData({ ...formData, passbook_exemption_flag: e.target.checked })}
              />
            }
            label="통장 면제"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={
              !formData.customer_id ||
              !formData.product_code ||
              !formData.real_name_identification_number ||
              !formData.account_password ||
              formData.cash_amount <= 0 ||
              formData.linked_substitute_amount < 0
            }
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts; 