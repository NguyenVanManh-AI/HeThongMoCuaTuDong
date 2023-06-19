import sqlite3

def insert(name,phone):
    conn = sqlite3.connect('./test.db')
    conn.execute("create table if not exists faces (id INTEGER PRIMARY KEY AUTOINCREMENT,name text,phone text)")
    cursor = conn.execute(f"select id from faces where name='{name}' and phone='{phone}'")
    for i in cursor:
        if i!=None:
            conn.close()
            return
    conn.execute(f"insert into faces(name,phone) values('{name}','{phone}')")
    conn.commit()
    conn.close()
def getIdWithNameAndPhone(name,phone):
        conn = sqlite3.connect('./test.db')
        # cursor = conn.execute("SELECT * from faces")
        cursor = conn.execute(f"SELECT * from faces where phone='{phone}' and name='{name}'")
        id = 0
        for row in cursor:
            id=row[0]
        conn.close()
        return id

def getNameFaceWithPhone(phone):
    conn = sqlite3.connect('./test.db')

    cursor = conn.execute(f"Select id,name from faces where phone='{phone}'")

    faces = []

    for row in cursor:
        faces.append({"id":row[0],"name":row[1]})
    
    conn.close()
    return faces

def deleteFaceWithId(id):
    conn = sqlite3.connect('./test.db')

    cursor = conn.execute(f"delete from faces where id='{id}'")

    conn.commit()

    result = []
    for i in cursor:
        result.append(i)
    conn.close()
    return result

def getNamePhonewithId(id):
    conn = sqlite3.connect("./test.db")
    print(id)
    cursor = conn.execute(f"select phone,name from faces where id={id}")

    result = []

    for i in cursor:
        print(i)
        result.append({"phone":i[0],"name":i[1]})

    conn.close()

    return result