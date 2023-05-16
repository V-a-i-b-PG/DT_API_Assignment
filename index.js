const express = require('express');
const app = express();
const mysql = require('mysql2');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const baseUrl = '/api/v3/app';
const db = mysql.createConnection({
    user: 'root',
    password: 'vibhu@gm@il.',
    host: 'localhost',
    database: 'restful_api',
});
db.connect((err)=>{
    if(err){
        console.error('Error Connecting to the database');
        return;
    }
    console.log('Connected to MySQL database');
});
app.get(baseUrl+'/events', (req, res) => {
    const eventID = req.query.id;
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    if (eventID) 
    {
        // Handle the '/events?id=:event_id' endpoint
        db.query('SELECT * FROM events WHERE id = ?', [eventID], (error, results) => {
            if (error) 
            {
                res.status(500).json({ error: error.message });
            } 
            else if (results.length === 0) 
            {
                res.status(404).json({ error: 'Event not found' });
            } 
            else 
            {
                res.json(results[0]);
            }
        });
    } 
    else if (limit && page) 
    {
        const offset = (page-1)*limit;
        // Handle the '/events?type=latest&limit=5&page=1' endpoint
        db.query('SELECT * FROM events ORDER BY schedule DESC LIMIT ? OFFSET ?', [limit, offset], (error, results) => {
            if (error) 
            {
                console.log(offset);
                res.status(500).json({ error: error.message });
            } 
            else 
            {
                res.json(results);
            }
        });
    } 
    else if(!eventID && !limit && !page)
    {
        db.query('SELECT * FROM events', (error, results) => {
            if (error) 
            {
                res.status(500).json({ error: error.message });
            } 
            else if (results.length === 0) 
            {
                res.status(404).json({ error: 'Event not found' });
            } 
            else 
            {
                res.json(results);
            }
        });
    }
    else
    {
        res.json({error: "Invalid Request Point!"});
    }
});
app.post(baseUrl+'/events', (req,res) => {
    const {name, tagline, schedule, description, moderator, category, sub_category, rigor_rank} = req.body;
    db.query('INSERT INTO events (type, uid, name, tagline, schedule, description, moderator, category, sub_category, rigor_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', ['event', 18, name, tagline, schedule, description, moderator, category, sub_category, rigor_rank], (error, results) => {
        if (error) 
        {
            
            res.status(500).json({ error: error.message });
        }
        else 
        {
            res.json({ id: results.insertId });
        }
    });
});
app.put(baseUrl+'/events/:id', (req,res) => {
    const event_ID=parseInt(req.params.id);
    const {name, tagline, schedule, description, moderator, category, sub_category, rigor_rank} = req.body;
    db.query('UPDATE events SET type = ?, uid = ?, name = ?, tagline = ?, schedule = ?, description = ? ,moderator = ?, category = ?, sub_category = ?, rigor_rank = ? WHERE id = ?', ['event', 18, name, tagline, schedule, description, moderator, category, sub_category, rigor_rank, event_ID], (error, results) => {
        if (error) 
        {
            res.status(500).json({ error: error.message });
        }
        else if(results.affectedRows === 0)
        {
            res.status(404).json({error: 'Event not found'});
        }
        else
        {
            res.json({ message : 'Successfully Updated!'});
        }
    });
});
app.delete(baseUrl+'/events/:id',(req,res) => {
    const event_ID = req.params.id;
    db.query('DELETE FROM events WHERE id = ?',[event_ID], (error, results) => {
        if(error)
        {
            res.status(500).json({ error : error.message});
        }
        else if(results.affectedRows === 0)
        {
            res.status(404).json({ error : 'Event Not Found!'});
        }
        else
        {
            res.json({ message : 'Deleted Successfully'});
        }
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

