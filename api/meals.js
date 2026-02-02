import db from './db.js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    const { sectionId, id } = req.query;

    if (method === 'GET') {
      if (!sectionId) return res.status(400).json({ error: 'Section ID is required' });
      // "Return meals ordered by tried ASC (untried first), then created_at DESC"
      const meals = await db.query('SELECT * FROM meals WHERE section_id = ? ORDER BY tried ASC, created_at DESC', [sectionId]);
      return res.status(200).json(meals);
    }

    if (method === 'POST') {
      const { section_id, name } = req.body;
      if (!section_id || !name) return res.status(400).json({ error: 'Section ID and Name are required' });
      const info = await db.run('INSERT INTO meals (section_id, name) VALUES (?, ?)', [section_id, name]);
      return res.status(201).json({ id: info.lastInsertRowid, section_id, name, tried: 0 });
    }

    if (method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'ID is required' });
      const { tried } = req.body;
      if (tried === undefined) return res.status(400).json({ error: 'Tried status is required' });
      
      await db.run('UPDATE meals SET tried = ? WHERE id = ?', [tried ? 1 : 0, id]);
      return res.status(200).json({ id, tried });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID is required' });
      await db.run('DELETE FROM meals WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
