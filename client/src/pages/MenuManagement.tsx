import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Tabs, Tab, Typography } from '@mui/material';
import CategoryManager from '../components/menu/CategoryManager';
import MenuItemManager from '../components/menu/MenuItemManager';
import { getCategories } from '../api/menu';
import { MenuCategory } from '../types/menu';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-management-tabpanel-${index}`}
      aria-labelledby={`menu-management-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MenuManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('カテゴリーの取得に失敗しました:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="メニュー管理タブ"
          >
            <Tab label="カテゴリー管理" />
            <Tab label="メニューアイテム管理" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <CategoryManager />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <MenuItemManager categories={categories} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MenuManagement; 