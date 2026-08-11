import {useEffect, useState} from 'react'

/*
RoomsPage

SDD 4.5 Room management, front end

Everyone sees the list of rooms. Admins can add and delete, FR 2

*/

function RoomsPage(){
    const [rooms, setRooms] = useState([])
    const [form, setForm] = useState({name: '', capacity: '', special: false}) // default not special room
    const [message, setMessage] = useState('')

    const user = JSON.parse(localStorage.getItem('msmAuth') || 'null')
    const isAdmin = user && user.role == 'admin' // check admin


    const headers = {

        'Content-Type': 'application/json', userrole: user? user.role : '',
        userid: user ? user.id : ''
        }

    function fetchRooms() {
        fetch('http://localhost:3000/rooms')
        .then((res) => res.json())
        .then(setRooms)
        .catch(() => setMessage('Could not load any rooms'))
        }

    // fetch rooms when page loads
    useEffect(fetchRooms, [])

    function detectChange(e){
        const {name, value, type, checked} = e.target
        setForm({...form, [name]: type === 'checkbox' ? checked: value})
        }




   async function submit(e){
       e.preventDefault()

   const res = await fetch('http://localhost:3000/rooms', {
       method: 'POST', headers: headers, body: JSON.stringify({...form, capacity: Number(form.capacity)}) // convert to int
       })

   const data = await res.json()
   setMessage(res.ok ? 'Added ' + data.name : data.message)
   if (res.ok) setForm({name: '', capacity: '', special: false})
   fetchRooms()
   }

async function handleDelete(id){
    const res = await fetch('http://localhost:3000/rooms/' + id, {method: 'DELETE', headers: headers})
    const data = await res.json()
    setMessage(data.message) // in case meetings booked, cant delete
    fetchRooms()
    }

return(
    <div className="rooms-page">
        <h1>Rooms</h1>
        {message && <p>{message}</p>}

        {isAdmin && (
            <form onSubmit={submit}>
                <input name="name" placeholder="Room name"value={form.name} onChange={detectChange} required/>
                <input name="capacity" type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={detectChange} required/>
                <label>
                    <input name="special" type="checkbox" checked={form.special} onChange={detectChange}  />
                    Special Room? - Has a $100 fee
                </label>
                <button type="submit"> Confirm Room Creation </button>
            </form>
            )}

        <ul>
            {rooms.map((room) => (
                <li key={room._id}>
                    {room.name} - capacity {room.capacity}
                    {room.special && ' - Special $100'}
                    {isAdmin && <button onClick={() => handleDelete(room._id)}>Delete Room</button>}
                </li>

                ))}
        </ul>
    </div>
    )
}

export default RoomsPage