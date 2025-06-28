import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || !['teacher', 'form_teacher', 'admin'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { date, studentId, status } = req.body;
        
        const attendance = await prisma.attendance.create({
          data: {
            date: new Date(date),
            status,
            student: { connect: { id: parseInt(studentId) } },
            recordedBy: { connect: { id: parseInt(session.user.id) } }
          }
        });
        
        res.status(201).json(attendance);
      } catch (error) {
        res.status(400).json({ error: 'Failed to record attendance' });
      }
      break;

    case 'GET':
      try {
        const { studentId, classId, dateFrom, dateTo } = req.query;
        
        let where: any = {};
        if (studentId) where.studentId = parseInt(studentId as string);
        if (classId) where.student = { classId: parseInt(classId as string) };
        if (dateFrom && dateTo) {
          where.date = {
            gte: new Date(dateFrom as string),
            lte: new Date(dateTo as string)
          };
        }
        
        const attendance = await prisma.attendance.findMany({
          where,
          include: {
            student: true,
            recordedBy: true
          },
          orderBy: { date: 'desc' }
        });
        
        res.status(200).json(attendance);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance records' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}