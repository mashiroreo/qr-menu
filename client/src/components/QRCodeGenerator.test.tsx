import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCodeGenerator from './QRCodeGenerator';
import { generateQRCode } from '../api/qr';
import { getStoreInfo } from '../api/store';

// モック
jest.mock('../api/store', () => ({
  getStoreInfo: jest.fn().mockResolvedValue({ id: '1' }),
}));

jest.mock('../api/qr', () => ({
  generateQRCode: jest.fn().mockResolvedValue('/uploads/qr/test.png'),
}));

describe('QRCodeGenerator', () => {
  it('storeId 取得後にボタンが表示され、クリックで generateQRCode が呼ばれる', async () => {
    render(<QRCodeGenerator />);

    const button = await screen.findByRole('button', { name: 'QRコードを生成する' });
    await userEvent.click(button);

    expect(generateQRCode as jest.Mock).toHaveBeenCalledTimes(1);
    expect(generateQRCode as jest.Mock).toHaveBeenCalledWith('1');

    expect(await screen.findByAltText('QRコード')).toBeInTheDocument();
  });

  it('getStoreInfo エラー時にエラーメッセージを表示する', async () => {
    (getStoreInfo as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    render(<QRCodeGenerator />);

    expect(await screen.findByText('店舗情報の取得に失敗しました')).toBeInTheDocument();
  });
}); 