import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Cookies from 'js-cookie'
import  toast  from "react-hot-toast"

const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET
const API_COOKIE = process.env.NEXT_PUBLIC_COOKIE
 
export function DialogDemo() {
  const [key, setKey] = useState('')
  const [secret, setSecret] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (key === API_KEY && secret === API_SECRET) {
        Cookies.set('auth', API_COOKIE as string, {
        expires: 0.0104,
        sameSite: 'strict', 
      })
      toast.success("authenticated successfully")
      window.location.reload()
    } else {
      toast.error("authentication failed")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Admin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admin</DialogTitle>
          <DialogDescription>
            If you are an admin, please provide authentic API keys to get full access
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="key" className="text-right">
                API KEY
              </Label>
              <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secret" className="text-right">
                API SECRET
              </Label>
              <Input id="secret" value={secret} onChange={(e) => setSecret(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}