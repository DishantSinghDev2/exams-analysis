import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Data for the specific AnswerKey from your request
const answerKeyData = {
    id: 'cmc37w9c30002urtoc154lnqc',
    examName: 'CUET',
    examYear: '2025',
    examDate: new Date('2025-05-30T00:00:00.000Z'),
    shiftName: 'Shift 2, Afternoon',
    subjectCombination: 'Combination 2',
    subject: 'Chemistry',
    isApproved: true,
    submittedBy: 'admin',
    createdAt: new Date('2025-06-19T10:07:39.075Z'),
    updatedAt: new Date('2025-06-19T10:07:39.075Z'),
    answers: [
        { questionId: '226895705669', correctAnswerId: '2268952736039' },
        { questionId: '226895705670', correctAnswerId: '2268952736043' },
        { questionId: '226895705671', correctAnswerId: '2268952736047' },
        { questionId: '226895705672', correctAnswerId: '2268952736053' },
        { questionId: '226895705673', correctAnswerId: '2268952736054' },
        { questionId: '226895705674', correctAnswerId: '2268952736058' },
        { questionId: '226895705675', correctAnswerId: '2268952736064' },
        { questionId: '226895705676', correctAnswerId: '2268952736066' },
        { questionId: '226895705677', correctAnswerId: '2268952736071' },
        { questionId: '226895705678', correctAnswerId: '2268952736076' },
        { questionId: '226895705679', correctAnswerId: '2268952736078' },
        { questionId: '226895705680', correctAnswerId: '2268952736083' },
        { questionId: '226895705681', correctAnswerId: '2268952736089' },
        { questionId: '226895705682', correctAnswerId: '2268952736093' },
        { questionId: '226895705683', correctAnswerId: '2268952736094' },
        { questionId: '226895705684', correctAnswerId: '2268952736100' },
        { questionId: '226895705685', correctAnswerId: '2268952736104' },
        { questionId: '226895705686', correctAnswerId: '2268952736109' },
        { questionId: '226895705687', correctAnswerId: '2268952736113' },
        { questionId: '226895705688', correctAnswerId: '2268952736115' },
        { questionId: '226895705689', correctAnswerId: '2268952736121' },
        { questionId: '226895705690', correctAnswerId: '2268952736122' },
        { questionId: '226895705691', correctAnswerId: '2268952736127' },
        { questionId: '226895705692', correctAnswerId: '2268952736131' },
        { questionId: '226895705693', correctAnswerId: '2268952736136' },
        { questionId: '226895705694', correctAnswerId: '2268952736138' },
        { questionId: '226895705695', correctAnswerId: '2268952736144' },
        { questionId: '226895705696', correctAnswerId: '2268952736147' },
        { questionId: '226895705697', correctAnswerId: '2268952736153' },
        { questionId: '226895705698', correctAnswerId: '2268952736154' },
        { questionId: '226895705699', correctAnswerId: '2268952736158' },
        { questionId: '226895705700', correctAnswerId: '2268952736163' },
        { questionId: '226895705701', correctAnswerId: '2268952736168' },
        { questionId: '226895705702', correctAnswerId: '2268952736170' },
        { questionId: '226895705703', correctAnswerId: '2268952736174' },
        { questionId: '226895705704', correctAnswerId: '2268952736181' },
        { questionId: '226895705705', correctAnswerId: '2268952736183' },
        { questionId: '226895705706', correctAnswerId: '2268952736188' },
        { questionId: '226895705707', correctAnswerId: '2268952736193' },
        { questionId: '226895705708', correctAnswerId: '2268952736197' },
        { questionId: '226895705710', correctAnswerId: '2268952736198' },
        { questionId: '226895705711', correctAnswerId: '2268952736203' },
        { questionId: '226895705712', correctAnswerId: '2268952736207' },
        { questionId: '226895705713', correctAnswerId: '2268952736211' },
        { questionId: '226895705714', correctAnswerId: '2268952736215' },
        { questionId: '226895705716', correctAnswerId: '2268952736218' },
        { questionId: '226895705717', correctAnswerId: '2268952736225' },
        { questionId: '226895705718', correctAnswerId: '2268952736229' },
        { questionId: '226895705719', correctAnswerId: '2268952736231' },
        { questionId: '226895705720', correctAnswerId: '2268952736236' },
    ],
};

async function main() {
    console.log('Start seeding ...');

    // 1. Clean up the database
    // The order is important to avoid foreign key constraint violations.
    // We delete "leaf" models first, then the ones they depend on.
    // Alternatively, since we use `onDelete: Cascade`, we can just delete the top-level Exam.
    console.log('Cleaning database...');
    await prisma.studentResponse.deleteMany();
    await prisma.markingScheme.deleteMany();
    await prisma.answerKey.deleteMany();
    await prisma.pendingAnswerKey.deleteMany();
    // Deleting Exam will cascade delete ExamDate, ExamShift, and SubjectCombination
    await prisma.exam.deleteMany();
    await prisma.admin.deleteMany();
    console.log('Database cleaned.');

    // 2. Create Admin user (make your changes here to be the first admin)
    await prisma.admin.create({
        data: {
            email: 'shahdilipkumar909@gmail.com', // Your github public email only
            githubId: '', // Your GitHub ID will be set automatically after first login
            name: 'Admin User',
        },
    });
    console.log('Admin user created.');

    // 3. Create the Exam hierarchy using a nested write
    // This ensures all related models (Exam, ExamDate, ExamShift, SubjectCombination) are created correctly.
    console.log('Creating Exam hierarchy...');
    await prisma.exam.create({
        data: {
            id: 'cmcdijmao0001ur1s3xael7bh',
            name: 'CUET',
            year: '2025',
            description: 'Common University Entrance Test',
            hasSubjectCombinations: true,
            examDates: {
                create: [
                    {
                        id: 'cmcdijmao0002ur1s5arqztdm',
                        date: answerKeyData.examDate, // Use the specific date from our target data
                        examShifts: {
                            create: {
                                id: 'cmcdijmap0003ur1scj94mxvd',
                                shiftName: answerKeyData.shiftName, // Use the specific shift
                                startTime: '02:00 PM',
                                endTime: '05:00 PM',
                                subjectCombinations: {
                                    create: [
                                        {
                                            id: 'cmcdijmap0004ur1sbhga0zao',
                                            name: answerKeyData.subjectCombination, // Use the specific combination
                                            subjects: [answerKeyData.subject], // Use the specific subject
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
        },
    });
    console.log('Exam hierarchy created.');

    // 4. Create the specific AnswerKey
    console.log('Creating AnswerKey...');
    await prisma.answerKey.create({
        data: {
            ...answerKeyData,
            answers: answerKeyData.answers as Prisma.JsonArray,
        },
    });
    console.log(`AnswerKey with ID ${answerKeyData.id} created.`);

    // 5. Create a corresponding MarkingScheme
    console.log('Creating MarkingScheme...');
    await prisma.markingScheme.create({
        data: {
            examName: answerKeyData.examName,
            examYear: answerKeyData.examYear,
            examDate: answerKeyData.examDate,
            shiftName: answerKeyData.shiftName,
            subjectCombination: answerKeyData.subjectCombination,
            subject: answerKeyData.subject,
            correctMarks: 5,
            incorrectMarks: -1,
            unattemptedMarks: 0,
            totalQuestions: answerKeyData.answers.length,
            totalMarks: answerKeyData.answers.length * 5,
        },
    });
    console.log('MarkingScheme created.');

    // 6. Create a sample PendingAnswerKey
    console.log('Creating sample PendingAnswerKey...');
    await prisma.pendingAnswerKey.create({
        data: {
            examName: 'NEET',
            examYear: '2025',
            examDate: new Date('2025-05-05T00:00:00.000Z'),
            shiftName: 'Shift 1, Morning',
            subject: 'Physics',
            submittedBy: 'teacher@example.com',
            answerKeyData: '{"Q1": "A", "Q2": "C", ...}',
        },
    });
    console.log('Sample PendingAnswerKey created.');

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });