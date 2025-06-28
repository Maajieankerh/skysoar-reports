import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const teachers = await prisma.user.findMany({
          where: { role: { in: ['teacher', 'form_teacher'] } },
          include: { classes: { include: { class: true } } }
        });
        res.status(200).json(teachers);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teachers' });
      }
      break;

    case 'POST':
      try {
        const { email, name, password, role, classes } = req.body;
        const hashedPassword = await hash(password, 12);
        
        const teacher = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role,
            classes: {
              create: classes.map((classId: string) => ({
                class: { connect: { id: classId } },
                is_form_teacher: role === 'form_teacher'
              }))
            }
          }
        });
        
        res.status(201).json(teacher);
      } catch (error) {
        res.status(400).json({ error: 'Failed to create teacher' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}