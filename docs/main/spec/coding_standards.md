# コーディング規約

## 1. 型安全性

### 1.1 基本原則
- ✅ 必須: 明示的な型定義を使用
- ❌ 禁止: `any`および`unknown`の使用
- ❌ 禁止: 不必要な型定義の継承
- ✅ 必須: 型定義による明確なデータ構造（クラスまたはinterface）

### 1.2 例
```typescript
// ❌ 避けるべき例
const handleUser = (user: any) => {
  return user.name;
};

// ✅ 推奨される例
interface User {
  id: string;
  name: string;
  email: string;
}

const handleUser = (user: User): string => {
  return user.name;
};
```

## 2. DTOパターン

### 2.1 基本原則
- ✅ 必須: リクエスト・レスポンスごとに専用のDTO型を定義
- ✅ 必須: 入力と出力の型を明確に分離
- ✅ 推奨: 変換・マッピング処理の明示的な実装

### 2.2 例
```typescript
// リクエストDTO
interface CreateStoreRequestDto {
  name: string;
  description?: string;
  businessHours: string;
  closingDays: string;
  address: string;
  phone?: string;
  subdomain: string;
}

// レスポンスDTO
interface StoreResponseDto {
  id: string;
  name: string;
  description?: string;
  businessHours: string;
  closingDays: string;
  address: string;
  phone?: string;
  logoUrl?: string;
  subdomain: string;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 内部モデル
interface StoreEntity {
  id: string;
  name: string;
  description: string | null;
  businessHours: string;
  closingDays: string;
  address: string;
  phone: string | null;
  logoUrl: string | null;
  subdomain: string;
  qrCodeUrl: string | null;
  userPublicId: string;
  createdAt: Date;
  updatedAt: Date;
}

// マッピング関数
function mapEntityToResponseDto(entity: StoreEntity): StoreResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description || undefined,
    businessHours: entity.businessHours,
    closingDays: entity.closingDays,
    address: entity.address,
    phone: entity.phone || undefined,
    logoUrl: entity.logoUrl || undefined,
    subdomain: entity.subdomain,
    qrCodeUrl: entity.qrCodeUrl || undefined,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString()
  };
}
```

## 3. 状態の表現

### 3.1 基本原則
- ✅ 必須: 状態は文字列ではなく数値で保持
- ✅ 必須: 状態値は必ず列挙型(enum)で定義

### 3.2 例
```typescript
// ❌ 避けるべき例
const userStatus = "active";

// ✅ 推奨される例
enum UserStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  SUSPENDED = 2
}

const userStatus = UserStatus.ACTIVE;
```

## 4. エラーハンドリング

### 4.1 基本原則
- ✅ 必須: try-catchによる明示的なエラーハンドリング
- ✅ 必須: エラーオブジェクトの型付け
- ✅ 必須: 意味のあるエラーメッセージ

### 4.2 例
```typescript
interface ApiError {
  status: number;
  message: string;
}

const fetchData = async () => {
  try {
    const data = await api.get('/endpoint');
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    logger.error(`API Error: ${apiError.status} - ${apiError.message}`);
    throw new Error(`Failed to fetch data: ${apiError.message}`);
  }
};
```

## 5. 非同期処理

### 5.1 基本原則
- ✅ 必須: Promiseよりもasync/awaitを優先
- ✅ 必須: 非同期関数の戻り値型を明示

### 5.2 例
```typescript
// ❌ 避けるべき例
function fetchUsers() {
  return fetch('/api/users')
    .then(res => res.json())
    .then(data => data)
    .catch(err => console.error(err));
}

// ✅ 推奨される例
async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    return data as User[];
  } catch (error) {
    logger.error('Failed to fetch users:', error);
    throw error;
  }
}
```

## 6. 命名規則

### 6.1 基本原則
- 変数名: camelCase
- クラス名: PascalCase
- 定数: UPPER_SNAKE_CASE
- インターフェース: PascalCase（先頭にIは付けない）
- 型エイリアス: PascalCase

### 6.2 例
```typescript
// 変数
const userName = 'John Doe';

// クラス
class UserService {
  // ...
}

// 定数
const MAX_RETRY_COUNT = 3;

// インターフェース
interface UserData {
  // ...
}

// 型エイリアス
type UserStatus = 'active' | 'inactive' | 'suspended';
```

## 7. コメント規約

### 7.1 基本原則
- 複雑なロジックには必ずコメントを付ける
- JSDoc形式で関数の説明を記述
- TODOコメントは期限を明記

### 7.2 例
```typescript
/**
 * ユーザー情報を取得する
 * @param userId - ユーザーID
 * @returns ユーザー情報
 * @throws UserNotFoundError - ユーザーが見つからない場合
 */
async function getUser(userId: string): Promise<User> {
  // TODO: 2024/03/31までにキャッシュ機能を実装
  // ...
}
```
