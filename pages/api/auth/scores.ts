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
        const { studentId, subjectId, term, session: academicSession, ca1, ca2, exam, assignment } = req.body;
        
        // Calculate total score based on your grading system
        const totalScore = (ca1 * 0.2) + (ca2 * 0.2) + (exam * 0.6);
        
        const score = await prisma.scores.upsert({
          where: {
            student_id_subject_id_term_session: {
              student_id: studentId,
              subject_id: subjectId,
              term,
              session: academicSession
            }
          },
          update: {
            ca1_score: ca1,
            ca2_score: ca2,
            exam_score: exam,
            assignment_score: assignment,
            total_score: totalScore,
            grade: calculateGrade(totalScore),
            remark: getRemark(totalScore)
          },
          create: {
            student_id: studentId,
            subject_id: subjectId,
            term,
            session: academicSession,
            ca1_score: ca1,
            ca2_score: ca2,
            exam_score: exam,
            assignment_score: assignment,
            total_score: totalScore,
            grade: calculateGrade(totalScore),
            remark: getRemark(totalScore),
            teacher_id: parseInt(session.user.id)
          }
        });
        
        res.status(200).json(score);
      } catch (error) {
        res.status(400).json({ error: 'Failed to save scores' });
      }
      break;

    case 'GET':
      try {
        const { studentId, classId, term, session: academicSession } = req.query;
        
        let where: any = {};
        if (studentId) where.student_id = parseInt(studentId as string);
        if (classId) where.student = { class_id: parseInt(classId as string) };
        if (term) where.term = term;
        if (academicSession) where.session = academicSession;
        
        const scores = await prisma.scores.findMany({
          where,
          include: {
            student: true,
            subject: true,
            teacher: true
          }
        });
        
        res.status(200).json(scores);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scores' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function calculateGrade(score: number): string {
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function getRemark(score: number): string {
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Very Good';
  if (score >= 50) return 'Good';
  if (score >= 40) return 'Pass';
  return 'Fail';
}