import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import db from '../db/index.js'

const userRoutes = new Hono()
// const createUserSchema = z.object({
//   name: z.string("กรุณากรอกชื่อ").min(2, "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร"),
//   email: z.email("รูปแบบอีเมลไม่ถูกต้อง"),
// })
type User = {

  id: number
  username: string
  password: string
  firstname: string
  lastname: string

}

userRoutes.get('/', async (c) => {

  let sql = 'SELECT * FROM user'
  let stmt = db.prepare<[],User>(sql)
  let user : User[] = stmt.all()

  return c.json({ message: 'List of users' , data : user})
})

userRoutes.get('/:id', (c) => {

  const { id } = c.req.param()
  let sql = 'SELECT * FROM user WHERE id = @id'
  let stmt = db.prepare<{id:string},User>(sql)
  let user  = stmt.get({id:id})

  if (!user) {
    return c.json({ message: 'User not found' }, 404)
  }

  return c.json({
    message: `User detail for ID: ${id}`, 
    data: user 
  })
})

// userRoutes.get('/:id', (c) => {
//   const { id } = c.req.param()

//   return c.json({ message: `User detail for ID: ${id}`, data: { id } })
// })

// userRoutes.post('/',    
//     zValidator('json',createUserSchema)
//     , async (c) => {
//     const body = await c.req.json()
//     return c.json({ message: 'User created', data: body })
// })

export default  userRoutes ;