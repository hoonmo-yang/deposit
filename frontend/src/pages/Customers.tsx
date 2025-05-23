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
} from '@mui/material';
import { customerApi } from '../services/api';

interface Customer {
  customer_id: string;
  customer_name: string;
  customer_type: number;
  real_name_identification_number: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_type: 1,
    real_name_identification_number: '',
  });

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      customer_name: '',
      customer_type: 1,
      real_name_identification_number: '',
    });
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting form data:', formData);
      const response = await customerApi.create(formData);
      console.log('API Response:', response);
      handleClose();
      loadCustomers();
    } catch (error: any) {
      console.error('Error creating customer:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm('정말로 이 고객을 삭제하시겠습니까?')) {
      try {
        await customerApi.delete(customerId);
        loadCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">고객 관리</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          고객 추가
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>고객 ID</TableCell>
              <TableCell>고객명</TableCell>
              <TableCell>고객 유형</TableCell>
              <TableCell>실명 인증 번호</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customer_id}>
                <TableCell>{customer.customer_id}</TableCell>
                <TableCell>{customer.customer_name}</TableCell>
                <TableCell>
                  {customer.customer_type === 1 ? '개인' : '법인'}
                </TableCell>
                <TableCell>{customer.real_name_identification_number}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(customer.customer_id)}
                  >
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>새 고객 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="고객명"
            fullWidth
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>고객 유형</InputLabel>
            <Select
              value={formData.customer_type}
              label="고객 유형"
              onChange={(e) => setFormData({ ...formData, customer_type: Number(e.target.value) })}
            >
              <MenuItem value={1}>개인</MenuItem>
              <MenuItem value={2}>법인</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="실명 인증 번호"
            fullWidth
            value={formData.real_name_identification_number}
            onChange={(e) => setFormData({ ...formData, real_name_identification_number: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers; 