import {useEffect, useState} from 'react'

/*
MeetingsPage

Meeting Management Front End

Allows Clients to book a room and see their own meetings. use case: 2.7.4, 2.7.5, 2.7.8
Admins do not book meetings, they only see all meetings and can delete any of them. Use case 2.7.21 and 2.7.23
*/

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function MeetingsPage(){
    const[rooms, setRooms] = useState([])
    const[slots, setSlots] = useState([])
    const [meetings, setMeetings] = useState([])
    const[form, setForm] = useState({name: '', roomId: '', day: 'Monday', start: 0, paid: false})
    const[message, setMessage] = useState('')
    // meeting id, 1 input box per meeting
    const[invite, setInvite] = useState({})
    // room dropdown per meeting to move it. use case 2.7.11
    const[moveTo, setMoveTo] = useState({})

    // currently logged in user, saved by login page
    const user = JSON.parse(localStorage.getItem('msmAuth') || 'null')
    const isAdmin = user && user.role == 'admin'

    // token now goes on every request, and decodeAuth checks on server side
    const headers ={
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (user ? user.token : '')
        }

    // admins see all meetings, but clients only see their own
    const fetchUrl = isAdmin ? 'http://localhost:3000/meetings' : 'http://localhost:3000/meetings?mine=true'




    function fetchMeetings(){
        fetch(fetchUrl, {headers: headers})
        .then((res) => res.json())
        .then(setMeetings)
        .catch(() => setMessage('Error loading meetings'))
        }


    // get rooms and meetings as soon as page loads
    useEffect(() => {
        fetch('http://localhost:3000/rooms').then((res) => res.json()).then(setRooms)
        fetchMeetings()
    }, [])


    // refresh open slots every time diff room or slot selected
    function fetchSlots(){
        if (!form.roomId) return
        fetch('http://localhost:3000/meetings/free?roomId=' + form.roomId + '&day=' + form.day, {headers: headers})
        .then((res) => res.json())
        .then((data) => setSlots(data.slots))
        .catch(() => setSlots([]))
        }

    // refresh open slots every time diff room or slot selected
    useEffect(fetchSlots, [form.roomId, form.day])

    function detectChange(e){
        const {name, value, type, checked} = e.target
        // skip check when checkbox clicked (for special fee rooms would cause bug and need to reseelect time slot)
        setForm({...form, [name]: type=== 'checkbox' ? checked: value , start: type === 'checkbox' ? form.start : 0}) // reset slot when switched
        }

    async function submit(e){
        e.preventDefault()

        if (!form.start) return setMessage('Error: Pick time slot first') // time slot not chosen

        // all meetings only 1 hour, so end is not necessary only start
        const res = await fetch ('http://localhost:3000/meetings', {
            method: 'POST',
            headers: headers,
            body:
            JSON.stringify({
                name: form.name,
                roomId: form.roomId,
                day: form.day,
                start: form.start,
                end: form.start + 1, // 1 hr slots
                specialFeePaid: form.paid
                })
            })


            const data = await res.json()
            setMessage(res.ok ? 'Booked ' + data.name : data.message)
            if (res.ok){
                setForm({...form, name: '', start: 0, paid: false})
                }
            fetchMeetings()
            fetchSlots() // slot now taken
        }



        async function handleCancel(id){
            const res = await fetch('http://localhost:3000/meetings/' + id, {method: 'DELETE', headers: headers})
            const data = await res.json()
            setMessage(data.message)
            fetchMeetings()
            fetchSlots()// slot now open refresh
            }

        async function moveMeeting(meeting){
            const newRoom = rooms.find((room) => room._id == moveTo[meeting._id])

            if(!newRoom) return setMessage('Error: Pick a room to move to')

            // confirm move and alert no refund on $100 fee.
            let prompt = 'Move ' + meeting.name + ' to ' + newRoom.name + '?'
            if(newRoom.special) prompt = prompt + ' This room is special and will incur the $100 fee. The $100 will be charged to your card on file.'
            if (meeting.room.special && !newRoom.special) prompt = prompt + ' Warning: No refund for leaving special room.'
            if (!window.confirm(prompt)) return

            const res = await fetch('http://localhost:3000/meetings/' + meeting._id, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    name: meeting.name,
                    roomId: newRoom._id,
                    day: meeting.day,
                    start: meeting.start,
                    end: meeting.end,
                    specialFeePaid: newRoom.special
                    })
                })

            const data = await res.json()
            setMessage(res.ok ? 'Successfully moved to ' + newRoom.name : data.message)
            fetchMeetings()
            fetchSlots() // refresh
            }


        // POST email onto a meeting, use case 2.7.6

        async function handleInvite(id){
            const res = await fetch('http://localhost:3000/meetings/' + id + '/attendees', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({attendee: invite[id]})
                })

            const data = await res.json()
            setMessage(res.ok ? 'Invited Attendee' : data.message)
            if (res.ok) setInvite({...invite, [id]: ''}) // clear meetings box
            fetchMeetings()
            }

        async function removeAttendee(id, email){
            const res = await fetch('http://localhost:3000/meetings/' + id + '/attendees/' + encodeURIComponent(email),
                {
                    method: 'DELETE',
                    headers: headers
                    })

                const data = await res.json()
                setMessage(res.ok ? 'Removed attendee: ' + email : data.message)
                fetchMeetings()
            }

        // check room picked to see if special specialFee
        const picked = rooms.find((r) => r._id == form.roomId)

        return(
            <div className ="meetings-page">
                <h1>Meetings Management Page</h1>
                    {message && <p>{message}</p>}

                    {/* check, only clients book meetings not admins */}
                    {!isAdmin && (
                        <form onSubmit={submit}>
                            <input name="name" placeholder="Enter Meeting Name" value={form.name} onChange={detectChange} required/>

                            <select name="roomId" value={form.roomId} onChange={detectChange} required>
                                <option value="">Select Room </option>
                                {rooms.map((room) => (
                                    <option key={room._id} value={room._id}>
                                        {room.name} | capacity: {room.capacity} {room.special? ' | Special $100 fee' : ''}
                                    </option>
                                    ))}
                            </select>

                        <select name="day" value={form.day} onChange={detectChange}>
                            {WEEKDAYS.map((d) => <option key = {d} value={d}>{d}</option>)}
                        </select>

                        {/* Disable taken slots, mark taken. FR4 */}
                        <div className="slots">
                            {slots.map((slot) => (
                                <button key={slot.start} type="button" disabled={!slot.free} onClick={() => setForm({...form, start: slot.start})}>
                                    {slot.start}:00 - {slot.end}:00 {slot.free ? '' : '| Occupied'}
                                    </button>
                                    ))}
                        </div>

                        {/* Special rooms cost $100 FR5 */}
                        {picked && picked.special && (
                            <label>
                                <input name="paid" type="checkbox" checked={form.paid} onChange={detectChange}/>
                                By checking the box, I agree for my saved card on file to be charged the $100 special room fee.
                            </label>
                        )}

                        <button type="submit">Confirm and Book Meeting</button>
                        </form>
                )}

           {/* My Meetings section / admin view all, regular view only theirs */}
           <h2> {isAdmin? '[ADMIN] All Meetings' : 'My Meetings' } </h2>
               <ul>
                    {meetings.map((meeting) => (
                        <li key={meeting._id}>
                            {meeting.name} | {meeting.room.name} | {meeting.day} | {meeting.start}:00 to {meeting.end}:00 |
                            <button onClick={() => handleCancel(meeting._id)}>Cancel</button>
                            {!isAdmin && (
                            <div className="attendees">
                                <ul>
                                    {meeting.attendees.map((email) => (
                                        <li key={email}>
                                            {email}
                                            <button onClick={() => removeAttendee(meeting._id, email)}>Remove</button>
                                        </li>
                                        ))}
                                </ul>
                                {/* Pending invites */}
                                <ul>
                                    {meeting.invited.map((email) => (
                                        <li key = {email}>
                                            {email} | (pending)
                                            <button onClick={() => removeAttendee(meeting._id, email)}>Remove</button>
                                        </li>
                                        ))}
                                </ul>

                                <input
                                    placeholder="Enter attendee email"
                                    value={invite[meeting._id] || ''}
                                    onChange={(e) => setInvite({...invite, [meeting._id]: e.target.value})}
                                    />
                                <button onClick={() => handleInvite(meeting._id)}>Invite Attendee</button>

                            {/* Move meeting to new room */}
                            <select value={moveTo[meeting._id] || ''} onChange={(e) => setMoveTo({...moveTo, [meeting._id]: e.target.value })}>
                                <option value="">Move to room: </option>
                                {rooms.map((room) => (
                                    <option key = {room._id} value={room._id}>
                                        {room.name} {room.special ? ' | Special $100' : ''}
                                    </option>
                                    ))}
                            </select>
                            <button onClick={() => moveMeeting(meeting)}>Confirm Move</button>
                            </div>
                            )}
                        </li>
                        ))}
                </ul>
           </div>
        )
}

export default MeetingsPage


