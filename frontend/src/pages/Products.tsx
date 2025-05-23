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
import { productApi } from '../services/api';

interface Product {
  product_code: string;
  product_name: string;
  eligible_customer_type: number;
  taxation_code: string;
  eligible_age: number;
  base_interest_rate: number;
  additional_interest_rate: number;
  applied_interest_rate: number;
  registration_date: string;
  last_modified_date: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_code: '',
    product_name: '',
    eligible_customer_type: 1,
    taxation_code: '1',
    eligible_age: 18,
    base_interest_rate: 0,
    additional_interest_rate: 0,
    applied_interest_rate: 0,
  });

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      product_code: '',
      product_name: '',
      eligible_customer_type: 1,
      taxation_code: '1',
      eligible_age: 18,
      base_interest_rate: 0,
      additional_interest_rate: 0,
      applied_interest_rate: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting form data:', formData);
      const response = await productApi.create(formData);
      console.log('API Response:', response);
      handleClose();
      loadProducts();
    } catch (error: any) {
      console.error('Error creating product:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handleDelete = async (productCode: string) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        await productApi.delete(productCode);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">상품 관리</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          상품 추가
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>상품 코드</TableCell>
              <TableCell>상품명</TableCell>
              <TableCell>고객 유형</TableCell>
              <TableCell>과세 코드</TableCell>
              <TableCell>가입 연령</TableCell>
              <TableCell>기본 금리 (%)</TableCell>
              <TableCell>가산 금리 (%)</TableCell>
              <TableCell>적용 금리 (%)</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.product_code}>
                <TableCell>{product.product_code}</TableCell>
                <TableCell>{product.product_name}</TableCell>
                <TableCell>
                  {product.eligible_customer_type === 1 ? '개인' : '법인'}
                </TableCell>
                <TableCell>{product.taxation_code}</TableCell>
                <TableCell>{product.eligible_age}세</TableCell>
                <TableCell>{product.base_interest_rate}%</TableCell>
                <TableCell>{product.additional_interest_rate}%</TableCell>
                <TableCell>{product.applied_interest_rate}%</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(product.product_code)}
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
        <DialogTitle>새 상품 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="상품 코드 (6자리)"
            fullWidth
            value={formData.product_code}
            onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
            inputProps={{ maxLength: 6 }}
          />
          <TextField
            margin="dense"
            label="상품명"
            fullWidth
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>고객 유형</InputLabel>
            <Select
              value={formData.eligible_customer_type}
              label="고객 유형"
              onChange={(e) => setFormData({ ...formData, eligible_customer_type: Number(e.target.value) })}
            >
              <MenuItem value={1}>개인</MenuItem>
              <MenuItem value={2}>법인</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="과세 코드"
            fullWidth
            value={formData.taxation_code}
            onChange={(e) => setFormData({ ...formData, taxation_code: e.target.value })}
            inputProps={{ maxLength: 1 }}
          />
          <TextField
            margin="dense"
            label="가입 연령"
            type="number"
            fullWidth
            value={formData.eligible_age}
            onChange={(e) => setFormData({ ...formData, eligible_age: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="기본 금리 (%)"
            fullWidth
            value={formData.base_interest_rate}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData({
                ...formData,
                base_interest_rate: value === '' ? 0 : parseInt(value, 10)
              });
            }}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
          />
          <TextField
            margin="dense"
            label="가산 금리 (%)"
            fullWidth
            value={formData.additional_interest_rate}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData({
                ...formData,
                additional_interest_rate: value === '' ? 0 : parseInt(value, 10)
              });
            }}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
          />
          <TextField
            margin="dense"
            label="적용 금리 (%)"
            fullWidth
            value={formData.applied_interest_rate}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData({
                ...formData,
                applied_interest_rate: value === '' ? 0 : parseInt(value, 10)
              });
            }}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
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

export default Products; 