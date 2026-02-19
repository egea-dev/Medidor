import { query } from './src/config/database';
import { v4 as uuidv4 } from 'uuid';

async function test() {
    try {
        const projectId = uuidv4();
        const userId = '1'; // Assuming a test user id or similar

        console.log('Testing INSERT with date...');
        await query(
            `INSERT INTO projects 
            (id, user_id, first_name, last_name, email, phone, location, job_type, date, rail_type, observations, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                projectId, userId, 'Test', 'User',
                'test@example.com', '123456789', 'Test Location', 'Test Job',
                '2024-02-18', 'Test Rail', 'Test Observations', 'in_progress'
            ]
        );
        console.log('Insert successful!');

        // Cleanup
        await query('DELETE FROM projects WHERE id = ?', [projectId]);
        console.log('Cleanup successful!');
    } catch (error: any) {
        console.error('Test Failed:', error.message);
        if (error.sqlMessage) console.error('SQL Message:', error.sqlMessage);
        if (error.sql) console.error('SQL Query:', error.sql);
    }
}

test();
