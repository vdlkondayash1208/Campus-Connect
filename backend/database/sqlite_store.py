import sqlite3
import json
import os
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "campus_connect.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        bio TEXT DEFAULT '',
        branch TEXT DEFAULT 'CSE',
        year TEXT DEFAULT '1',
        skills TEXT DEFAULT '[]',
        interests TEXT DEFAULT '[]',
        role TEXT NOT NULL DEFAULT 'student',
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        category TEXT DEFAULT 'Technology',
        club TEXT DEFAULT 'Engineering Council',
        event_date TEXT,
        start_time TEXT DEFAULT '10:00:00',
        end_time TEXT DEFAULT '18:00:00',
        venue TEXT DEFAULT 'Campus Center',
        venue_name TEXT DEFAULT 'Campus Center',
        capacity INTEGER NOT NULL DEFAULT 100,
        registered INTEGER NOT NULL DEFAULT 0,
        registration_deadline TEXT,
        required_skills TEXT DEFAULT '[]',
        tags TEXT DEFAULT '[]',
        is_team_event INTEGER NOT NULL DEFAULT 0,
        min_team_size INTEGER NOT NULL DEFAULT 1,
        max_team_size INTEGER NOT NULL DEFAULT 4,
        required_registration_fields TEXT DEFAULT '["Full Name", "Roll Number", "Department", "GitHub URL"]',
        latitude REAL DEFAULT 17.385044,
        longitude REAL DEFAULT 78.486671,
        start_at TEXT,
        deadline_at TEXT,
        expire_at TEXT,
        status TEXT NOT NULL DEFAULT 'Active',
        created_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(created_by) REFERENCES profiles(id) ON DELETE SET NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_registrations (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT,
        credentials TEXT DEFAULT '{}',
        registered_at TEXT NOT NULL,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES profiles(id) ON DELETE CASCADE,
        UNIQUE(event_id, student_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        preferred_skills TEXT DEFAULT '[]',
        team_code TEXT UNIQUE NOT NULL,
        leader_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY(leader_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT,
        role TEXT NOT NULL DEFAULT 'member',
        joined_at TEXT NOT NULL,
        FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES profiles(id) ON DELETE CASCADE,
        UNIQUE(team_id, student_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS team_invitations (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        receiver_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
        UNIQUE(team_id, receiver_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pulse_activities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        user_id TEXT,
        event_id TEXT,
        action_label TEXT DEFAULT 'View',
        action_link TEXT DEFAULT '/events',
        created_at TEXT NOT NULL,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    );
    """)

    # Ensure verified admin profile exists
    cursor.execute("SELECT id FROM profiles WHERE email = 'faculty.admin@university.edu';")
    if not cursor.fetchone():
        now = datetime.utcnow().isoformat()
        cursor.execute("""
        INSERT INTO profiles (id, email, full_name, bio, branch, year, skills, interests, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            'admin_faculty_1',
            'faculty.admin@university.edu',
            'Dr. Sarah Mitchell',
            'Faculty Advisor & Head of Engineering Council',
            'Administration',
            'Faculty',
            json.dumps(['Academic Leadership', 'Event Coordination']),
            json.dumps(['Student Innovation', 'Tech Symposia']),
            'admin',
            now
        ))

    conn.commit()
    conn.close()

def purge_all_records():
    """TRUNCATE / DELETE all dummy events, registrations, teams, invitations, and non-admin profiles."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM pulse_activities;")
    cursor.execute("DELETE FROM team_invitations;")
    cursor.execute("DELETE FROM team_members;")
    cursor.execute("DELETE FROM teams;")
    cursor.execute("DELETE FROM event_registrations;")
    cursor.execute("DELETE FROM events;")
    # Keep only faculty admin profiles
    cursor.execute("DELETE FROM profiles WHERE role != 'admin' AND email NOT LIKE '%faculty%';")
    conn.commit()
    conn.close()

# --- Profiles ---
def ensure_profile(user_id, email, full_name=None, role='student', skills=None, interests=None):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM profiles WHERE email = ?;", (email,))
    row = cursor.fetchone()
    now = datetime.utcnow().isoformat()
    if not row:
        cursor.execute("SELECT id FROM profiles WHERE id = ?;", (user_id,))
        row_id = cursor.fetchone()
        if not row_id:
            cursor.execute("""
            INSERT INTO profiles (id, email, full_name, bio, branch, year, skills, interests, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                user_id,
                email,
                full_name or email.split('@')[0],
                '',
                'CSE',
                '1',
                json.dumps(skills or ['React', 'Python']),
                json.dumps(interests or ['Hackathons']),
                role,
                now
            ))
            actual_id = user_id
        else:
            actual_id = row_id["id"]
    else:
        actual_id = row["id"]
        cursor.execute("UPDATE profiles SET role = ?, full_name = COALESCE(?, full_name) WHERE id = ?;", (role, full_name, actual_id))
    conn.commit()
    conn.close()
    return actual_id

# --- Events CRUD ---
def db_get_events():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY created_at DESC;")
    rows = cursor.fetchall()
    events = []
    for r in rows:
        events.append({
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "category": r["category"],
            "club": r["club"],
            "date": r["event_date"] or "Upcoming",
            "time": r["start_time"] or "10:00 AM",
            "venue": r["venue"],
            "venue_name": r["venue_name"],
            "capacity": r["capacity"],
            "registered": r["registered"],
            "requiredSkills": json.loads(r["required_skills"] or "[]"),
            "tags": json.loads(r["tags"] or "[]"),
            "is_team_event": bool(r["is_team_event"]),
            "min_team_size": r["min_team_size"],
            "max_team_size": r["max_team_size"],
            "required_registration_fields": json.loads(r["required_registration_fields"] or "[]"),
            "latitude": r["latitude"],
            "longitude": r["longitude"],
            "start_at": r["start_at"],
            "deadline_at": r["deadline_at"],
            "expire_at": r["expire_at"],
            "status": r["status"]
        })
    conn.close()
    return events

def db_create_event(data, created_by_id):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    event_id = data.get("id") or str(uuid.uuid4())
    
    venue = data.get("venue") or data.get("venue_name") or "Main Campus"
    venue_name = data.get("venue_name") or venue
    event_date = data.get("event_date") or (data.get("start_at")[:10] if data.get("start_at") else now[:10])
    start_time = data.get("start_time") or "10:00:00"
    end_time = data.get("end_time") or "18:00:00"
    capacity = int(data.get("capacity") or 100)
    is_team = 1 if data.get("is_team_event") else 0
    min_size = int(data.get("min_team_size") or 1)
    max_size = int(data.get("max_team_size") or 4)

    req_fields = data.get("required_registration_fields") or ["Full Name", "Roll Number", "Department", "GitHub URL"]
    req_skills = data.get("required_skills") or data.get("tags") or []
    tags = data.get("tags") or req_skills

    creator = None
    if created_by_id:
        cursor.execute("SELECT id FROM profiles WHERE id = ?;", (created_by_id,))
        if cursor.fetchone():
            creator = created_by_id
        else:
            cursor.execute("SELECT id FROM profiles WHERE role = 'admin' LIMIT 1;")
            admin_row = cursor.fetchone()
            if admin_row:
                creator = admin_row["id"]

    cursor.execute("""
    INSERT INTO events (
        id, title, description, category, club, event_date, start_time, end_time,
        venue, venue_name, capacity, registered, registration_deadline,
        required_skills, tags, is_team_event, min_team_size, max_team_size,
        required_registration_fields, latitude, longitude, start_at, deadline_at,
        expire_at, status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?);
    """, (
        event_id,
        data.get("title", "Untitled Event"),
        data.get("description", ""),
        data.get("category", "Technology"),
        data.get("club") or data.get("organiser") or "Campus Council",
        event_date,
        start_time,
        end_time,
        venue,
        venue_name,
        capacity,
        data.get("deadline_at") or data.get("registration_deadline"),
        json.dumps(req_skills),
        json.dumps(tags),
        is_team,
        min_size,
        max_size,
        json.dumps(req_fields),
        float(data.get("latitude") or 17.385044),
        float(data.get("longitude") or 78.486671),
        data.get("start_at"),
        data.get("deadline_at"),
        data.get("expire_at"),
        creator,
        now,
        now
    ))
    conn.commit()
    conn.close()

    return {
        "id": event_id,
        "title": data.get("title"),
        "description": data.get("description", ""),
        "category": data.get("category", "Technology"),
        "club": data.get("club") or data.get("organiser") or "Campus Council",
        "date": event_date,
        "time": start_time,
        "venue": venue,
        "venue_name": venue_name,
        "capacity": capacity,
        "registered": 0,
        "requiredSkills": req_skills,
        "tags": tags,
        "is_team_event": bool(is_team),
        "min_team_size": min_size,
        "max_team_size": max_size,
        "required_registration_fields": req_fields,
        "start_at": data.get("start_at"),
        "deadline_at": data.get("deadline_at"),
        "expire_at": data.get("expire_at"),
        "status": "Active"
    }

def db_update_event(event_id, data):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    updates = []
    params = []

    fields_map = {
        "title": "title",
        "description": "description",
        "category": "category",
        "club": "club",
        "venue": "venue",
        "venue_name": "venue_name",
        "capacity": "capacity",
        "status": "status",
        "start_at": "start_at",
        "deadline_at": "deadline_at",
        "expire_at": "expire_at"
    }

    for k, col in fields_map.items():
        if k in data:
            updates.append(f"{col} = ?")
            params.append(data[k])

    if "is_team_event" in data:
        updates.append("is_team_event = ?")
        params.append(1 if data["is_team_event"] else 0)

    if "min_team_size" in data:
        updates.append("min_team_size = ?")
        params.append(int(data["min_team_size"]))

    if "max_team_size" in data:
        updates.append("max_team_size = ?")
        params.append(int(data["max_team_size"]))

    if "required_registration_fields" in data:
        updates.append("required_registration_fields = ?")
        params.append(json.dumps(data["required_registration_fields"]))

    if "tags" in data:
        updates.append("tags = ?")
        params.append(json.dumps(data["tags"]))

    if "required_skills" in data:
        updates.append("required_skills = ?")
        params.append(json.dumps(data["required_skills"]))

    if updates:
        updates.append("updated_at = ?")
        params.append(now)
        params.append(event_id)
        sql = f"UPDATE events SET {', '.join(updates)} WHERE id = ?;"
        cursor.execute(sql, params)
        conn.commit()

    conn.close()
    return True

def db_delete_event(event_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE id = ?;", (event_id,))
    conn.commit()
    conn.close()
    return True

# --- Registrations ---
def db_register_for_event(event_id, user_id, user_name, credentials):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check event exists & capacity
    cursor.execute("SELECT capacity, registered, is_team_event, min_team_size, max_team_size FROM events WHERE id = ?;", (event_id,))
    ev = cursor.fetchone()
    if not ev:
        conn.close()
        raise ValueError("Event not found")
        
    if ev["registered"] >= ev["capacity"]:
        conn.close()
        raise ValueError("Event is at full capacity")

    # Check already registered
    cursor.execute("SELECT id FROM event_registrations WHERE event_id = ? AND student_id = ?;", (event_id, user_id))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return {
            "success": True,
            "message": "Already registered for event",
            "registration_id": existing["id"],
            "ticket_id": f"TKT-{str(event_id)[:4].upper()}-EXISTING",
            "event_id": event_id
        }

    now = datetime.utcnow().isoformat()
    reg_id = f"reg_{str(event_id)[:6]}_{str(user_id)[:6]}_{int(datetime.utcnow().timestamp())}"
    
    # Ensure profile exists for student
    cursor.execute("SELECT id FROM profiles WHERE id = ?;", (user_id,))
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO profiles (id, email, full_name, role, created_at)
        VALUES (?, ?, ?, 'student', ?);
        """, (user_id, f"{user_id}@campusconnect.edu", user_name, now))

    cursor.execute("""
    INSERT INTO event_registrations (id, event_id, student_id, student_name, credentials, registered_at)
    VALUES (?, ?, ?, ?, ?, ?);
    """, (
        reg_id,
        event_id,
        user_id,
        user_name,
        json.dumps(credentials or {}),
        now
    ))

    # Increment registered count
    cursor.execute("UPDATE events SET registered = registered + 1 WHERE id = ?;", (event_id,))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Successfully registered for event!",
        "registration_id": reg_id,
        "ticket_id": f"TKT-{str(event_id)[:4].upper()}-{str(uuid.uuid4())[:4].upper()}",
        "event_id": event_id,
        "is_team_event": bool(ev["is_team_event"]),
        "min_team_size": ev["min_team_size"],
        "max_team_size": ev["max_team_size"],
        "registered_at": now,
        "credentials": credentials
    }

# --- Teams ---
def db_create_team(event_id, user_id, user_name, team_name, description, preferred_skills, team_code):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    team_id = f"team_{str(event_id)[:4]}_{int(datetime.utcnow().timestamp())}"

    # Verify event
    cursor.execute("SELECT min_team_size, max_team_size FROM events WHERE id = ?;", (event_id,))
    ev = cursor.fetchone()
    min_size = ev["min_team_size"] if ev else 2
    max_size = ev["max_team_size"] if ev else 4
    # Ensure leader profile exists
    cursor.execute("SELECT id FROM profiles WHERE id = ?;", (user_id,))
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO profiles (id, email, full_name, role, created_at)
        VALUES (?, ?, ?, 'student', ?);
        """, (user_id, f"{user_id}@campusconnect.edu", user_name, now))

    cursor.execute("""
    INSERT INTO teams (id, event_id, name, description, preferred_skills, team_code, leader_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        team_id,
        event_id,
        team_name,
        description or "",
        json.dumps(preferred_skills or []),
        team_code,
        user_id,
        now,
        now
    ))

    cursor.execute("""
    INSERT INTO team_members (id, team_id, student_id, student_name, role, joined_at)
    VALUES (?, ?, ?, ?, 'leader', ?);
    """, (
        str(uuid.uuid4()),
        team_id,
        user_id,
        user_name,
        now
    ))

    conn.commit()
    conn.close()

    return {
        "id": team_id,
        "event_id": event_id,
        "name": team_name,
        "description": description or "",
        "preferred_skills": preferred_skills or [],
        "team_code": team_code,
        "leader_id": user_id,
        "min_team_size": min_size,
        "max_team_size": max_size,
        "members": [
            {
                "student_id": user_id,
                "full_name": user_name,
                "role": "leader",
                "joined_at": now
            }
        ],
        "invitations": []
    }

def db_get_team_for_event(event_id, user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT t.* FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE t.event_id = ? AND tm.student_id = ?;
    """, (event_id, user_id))
    t = cursor.fetchone()
    if not t:
        conn.close()
        return None

    team_id = t["id"]
    cursor.execute("SELECT * FROM team_members WHERE team_id = ?;", (team_id,))
    members_rows = cursor.fetchall()
    members = [{
        "student_id": m["student_id"],
        "full_name": m["student_name"] or "Teammate",
        "role": m["role"],
        "joined_at": m["joined_at"]
    } for m in members_rows]

    cursor.execute("SELECT * FROM team_invitations WHERE team_id = ?;", (team_id,))
    inv_rows = cursor.fetchall()
    invitations = [{
        "id": i["id"],
        "receiver_id": i["receiver_id"],
        "receiver_name": i["receiver_name"],
        "status": i["status"],
        "created_at": i["created_at"]
    } for i in inv_rows]

    conn.close()
    return {
        "id": t["id"],
        "event_id": t["event_id"],
        "name": t["name"],
        "description": t["description"],
        "preferred_skills": json.loads(t["preferred_skills"] or "[]"),
        "team_code": t["team_code"],
        "leader_id": t["leader_id"],
        "members": members,
        "invitations": invitations
    }

def db_join_team(team_code, user_id, user_name):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM teams WHERE team_code = ?;", (team_code.upper().strip(),))
    team = cursor.fetchone()
    if not team:
        conn.close()
        raise ValueError(f"No squad found with code {team_code}")

    team_id = team["id"]
    cursor.execute("SELECT id FROM team_members WHERE team_id = ? AND student_id = ?;", (team_id, user_id))
    if cursor.fetchone():
        conn.close()
        return db_get_team_for_event(team["event_id"], user_id)

    now = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT INTO team_members (id, team_id, student_id, student_name, role, joined_at)
    VALUES (?, ?, ?, ?, 'member', ?);
    """, (str(uuid.uuid4()), team_id, user_id, user_name, now))

    conn.commit()
    conn.close()
    return db_get_team_for_event(team["event_id"], user_id)

def db_invite_team_member(team_id, sender_id, receiver_id, receiver_name):
    conn = get_db()
    cursor = conn.cursor()
    inv_id = f"inv_{str(team_id)[:6]}_{str(receiver_id)[:6]}_{int(datetime.utcnow().timestamp())}"
    now = datetime.utcnow().isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO team_invitations (id, team_id, sender_id, receiver_id, receiver_name, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?);
    """, (inv_id, team_id, sender_id, receiver_id, receiver_name, now))
    conn.commit()
    conn.close()
    return {
        "id": inv_id,
        "team_id": team_id,
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "receiver_name": receiver_name,
        "status": "pending",
        "created_at": now
    }

# --- Stats & Analytics ---
def db_get_dashboard_stats(user_id=None):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) as cnt FROM events WHERE status = 'Active';")
    upcoming_events = cursor.fetchone()["cnt"]

    if user_id:
        cursor.execute("SELECT count(*) as cnt FROM event_registrations WHERE student_id = ?;", (user_id,))
        registered_events = cursor.fetchone()["cnt"]
        cursor.execute("SELECT count(*) as cnt FROM profiles WHERE role != 'admin' AND id != ?;", (user_id,))
        teammates_count = cursor.fetchone()["cnt"]
    else:
        cursor.execute("SELECT count(*) as cnt FROM event_registrations;")
        registered_events = cursor.fetchone()["cnt"]
        cursor.execute("SELECT count(*) as cnt FROM profiles WHERE role != 'admin';")
        teammates_count = cursor.fetchone()["cnt"]

    conn.close()
    return {
        "upcomingEvents": upcoming_events,
        "registeredEvents": registered_events,
        "suggestedTeammates": teammates_count,
        "matches": 0,
        "recentActivity": []
    }

def db_get_admin_dashboard_stats():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) as cnt FROM profiles WHERE role != 'admin';")
    total_students = cursor.fetchone()["cnt"]

    cursor.execute("SELECT count(*) as cnt FROM events WHERE status = 'Active';")
    active_events = cursor.fetchone()["cnt"]

    cursor.execute("SELECT count(*) as cnt FROM events;")
    total_events = cursor.fetchone()["cnt"]

    cursor.execute("SELECT count(*) as cnt FROM event_registrations;")
    total_registrations = cursor.fetchone()["cnt"]

    cursor.execute("SELECT count(*) as cnt FROM teams;")
    total_teams = cursor.fetchone()["cnt"]

    # Top skills dynamically
    cursor.execute("SELECT skills FROM profiles;")
    skill_rows = cursor.fetchall()
    skill_map = {}
    for r in skill_rows:
        try:
            sk_list = json.loads(r["skills"] or "[]")
            for s in sk_list:
                skill_map[s] = skill_map.get(s, 0) + 1
        except Exception:
            pass

    top_skills = [{"skill": k, "count": v} for k, v in sorted(skill_map.items(), key=lambda x: x[1], reverse=True)[:8]]

    # Event capacities
    cursor.execute("SELECT id, title, club, registered, capacity, status FROM events;")
    ev_rows = cursor.fetchall()
    event_capacities = []
    for e in ev_rows:
        pct = min(100, round((e["registered"] / (e["capacity"] or 1)) * 100))
        event_capacities.append({
            "id": e["id"],
            "title": e["title"],
            "club": e["club"],
            "registered": e["registered"],
            "capacity": e["capacity"],
            "percent": pct,
            "status": "Full" if e["registered"] >= e["capacity"] else e["status"]
        })

    conn.close()
    return {
        "totalStudents": total_students,
        "total_students": total_students,
        "activeEvents": active_events,
        "active_events": active_events,
        "totalEvents": total_events,
        "total_events": total_events,
        "totalRegistrations": total_registrations,
        "total_registrations": total_registrations,
        "totalMatches": total_teams,
        "total_matches": total_teams,
        "totalTeams": total_teams,
        "total_teams": total_teams,
        "registrationVelocity": [],
        "registration_velocity": [],
        "topSkills": top_skills,
        "top_skills": top_skills,
        "eventCapacities": event_capacities,
        "event_capacities": event_capacities
    }

def db_get_admin_users():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE role != 'admin' ORDER BY created_at DESC;")
    rows = cursor.fetchall()
    users = []
    for r in rows:
        users.append({
            "id": r["id"],
            "full_name": r["full_name"],
            "email": r["email"],
            "branch": r["branch"],
            "year": r["year"],
            "skills": json.loads(r["skills"] or "[]"),
            "created_at": r["created_at"]
        })
    conn.close()
    return users
