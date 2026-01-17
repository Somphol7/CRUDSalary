import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

type Salary = {
  SalaryID: number;
  Amount: number;
  PayDate: string;
  Bonus: number;
  Status: 'Pending' | 'Paid' | 'Cancelled';
};

let salaries: Salary[] = [
  { SalaryID: 1, Amount: 50000, PayDate: '2024-01-25', Bonus: 2000, Status: 'Paid' }
];

let nextId = 2;

const salarySchema = z.object({
  Amount: z.number().min(0),
  PayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  Bonus: z.number().min(0).default(0),
  Status: z.enum(['Pending', 'Paid', 'Cancelled']).default('Pending')
});


// [R] READ ALL: ดึงข้อมูลทั้งหมดจาก Array
app.get('/', (c) => {
  return c.json({ 
    success: true, 
    count: salaries.length,
    data: salaries 
  });
});

// [R] READ ONE: ดึงข้อมูลตาม ID
app.get('/:id', (c) => {
  const id = Number(c.req.param('id')); // แปลง ID จาก URL เป็นตัวเลข
  const salary = salaries.find((s) => s.SalaryID === id);

  if (!salary) {
    return c.json({ success: false, message: 'Salary not found' }, 404);
  }
  return c.json({ success: true, data: salary });
});

// [C] CREATE
app.post('/', zValidator('json', salarySchema), (c) => {
  const data = c.req.valid('json');

  const newSalary: Salary = {
    SalaryID: nextId++, // กำหนด ID และบวกเพิ่มรอรอบถัดไป
    Amount: data.Amount,
    PayDate: data.PayDate,
    Bonus: data.Bonus,
    Status: data.Status as Salary['Status']
  };

  salaries.push(newSalary);

  return c.json({ 
    success: true, 
    message: 'Created successfully', 
    data: newSalary 
  }, 201);
});

// [U] UPDATE
app.put('/:id', zValidator('json', salarySchema.partial()), (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');

  const index = salaries.findIndex((s) => s.SalaryID === id);

  if (index === -1) {
    return c.json({ success: false, message: 'Salary not found' }, 404);
  }

  
  salaries[index] = { ...salaries[index], ...data };

  return c.json({ 
    success: true, 
    message: 'Updated successfully', 
    data: salaries[index] 
  });
});

// [D] DELETE:
app.delete('/:id', (c) => {
  const id = Number(c.req.param('id'));
  const index = salaries.findIndex((s) => s.SalaryID === id);

  if (index === -1) {
    return c.json({ success: false, message: 'Salary not found' }, 404);
  }

  salaries.splice(index, 1);

  return c.json({ success: true, message: 'Deleted successfully' });
});

export default app;