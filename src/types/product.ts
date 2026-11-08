export type ProductCategory =
  | 'mates'
  | 'yerbas'
  | 'dulces'
  | 'snacks'
  | 'sabores'
  | 'kits'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  imageUrl: string
  stock: number
  active: boolean
}
