import React, { useState, useEffect } from 'react';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemImage,
} from '../../api/menu';
import { MenuItem, MenuItemFormData, MenuItemImageData } from '../../types/menu';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Typography,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Card,
  CardMedia,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface MenuItemManagerProps {
  categories: { id: string; name: string }[];
}

const MenuItemManager: React.FC<MenuItemManagerProps> = ({ categories }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const data = await getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error('メニューアイテムの取得に失敗しました:', error);
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        categoryId: item.categoryId,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: categories[0]?.id || '',
      });
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id || '',
    });
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await updateMenuItemImage(editingItem.id, formData as unknown as MenuItemImageData);
        }
      } else {
        const newItem = await createMenuItem(formData);
        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await updateMenuItemImage(newItem.id, formData as unknown as MenuItemImageData);
        }
      }
      fetchMenuItems();
      handleCloseDialog();
    } catch (error) {
      console.error('メニューアイテムの保存に失敗しました:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id);
      fetchMenuItems();
    } catch (error) {
      console.error('メニューアイテムの削除に失敗しました:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">メニューアイテム管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          メニューアイテムを追加
        </Button>
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id}>
            <Card sx={{ display: 'flex', width: '100%' }}>
              {item.imageUrl && (
                <CardMedia
                  component="img"
                  sx={{ width: 100 }}
                  image={item.imageUrl}
                  alt={item.name}
                />
              )}
              <Box sx={{ flex: 1, p: 2 }}>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        ¥{item.price.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        カテゴリー: {categories.find(c => c.id === item.categoryId)?.name}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </Box>
            </Card>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'メニューアイテムを編集' : 'メニューアイテムを追加'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="商品名"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="説明"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="価格"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>カテゴリー</InputLabel>
            <Select
              value={formData.categoryId}
              label="カテゴリー"
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              {categories.map((category) => (
                <MuiMenuItem key={category.id} value={category.id}>
                  {category.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2 }}
          >
            画像をアップロード
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          {imageFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              選択されたファイル: {imageFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuItemManager; 