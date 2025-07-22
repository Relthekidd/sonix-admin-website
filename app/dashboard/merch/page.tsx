'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Spinner from '@/components/Spinner'
import { useToast } from '@/lib/useToast'

interface Product {
  id: string
  name: string
  price: number
  inventory: number
}

export default function MerchPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [inventory, setInventory] = useState(0)
  const [loading, setLoading] = useState(true)
  const { show, Toast } = useToast()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('products').select('id,name,price,inventory')
      if (error) show(error.message)
      else setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [show])

  const addProduct = async () => {
    const { error } = await supabase.from('products').insert({ name, price, inventory })
    if (error) show(error.message)
    else show('Product added')
  }

  const updateInventory = async (id: string, inv: number) => {
    const { error } = await supabase.from('products').update({ inventory: inv }).eq('id', id)
    if (error) show(error.message)
    else show('Inventory updated')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Merchandising</h1>
      <div className="space-y-2 border p-2 rounded">
        <input className="border p-1 w-full" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="border p-1 w-full" type="number" placeholder="Price" value={price} onChange={(e)=>setPrice(parseFloat(e.target.value))} />
        <input className="border p-1 w-full" type="number" placeholder="Inventory" value={inventory} onChange={(e)=>setInventory(parseInt(e.target.value))} />
        <button className="bg-black text-white px-3 py-1 rounded" onClick={addProduct}>Add</button>
      </div>
      {loading && <Spinner />}
      {!loading && (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left"><th className="p-2">Name</th><th className="p-2">Price</th><th className="p-2">Inventory</th></tr>
          </thead>
          <tbody>
            {products.map(p=> (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2">${p.price}</td>
                <td className="p-2">
                  <input type="number" className="border p-1 w-16" value={p.inventory} onChange={(e)=>updateInventory(p.id, parseInt(e.target.value))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Toast />
    </div>
  )
}
