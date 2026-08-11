import {useEffect, useState} from 'react'


/*
InboxPage

Handles meeting invitations waiting for a response. Use case 2.7.14
Will also handle Meeting transfer of ownership

Client accepts meeting and the meeting shows up in their meetings,
or rejects and invitation disappears

*/

function InboxPage(){
    const[invites, setInvites] = useState([])
    const[message, setMessage] = useState('')

    // currently logged in user by login page
    const user = JSON.parse(localStorage.getItem('msmAuth') || 'null')

    const headers = {
        'Content-Type' : 'application/json',
        Authorization: 'Bearer ' + (user ? user.token : '')
        }


    function fetchInvites(){
        fetch('http://localhost:3000/meetings?inbox=true', {headers: headers})
        .then((res) => res.json())
        .then(setInvites)
        .catch(() => setMessage('Error, could not load invites'))
        }

    // get invites, populate
    useEffect(fetchInvites,[])

    // now accept or reject invites, practically identical just different url (accept or reject)
    async function sendResponse(id, answer){
        const res = await fetch('http://localhost:3000/meetings/'+ id + '/' + answer, {
            method: 'POST',
            headers: headers
            })

        const info = await res.json()
        setMessage(info.message)
        fetchInvites() // update,removed from list
        }
    return(
        <div className = "inbox-page">
            <h1>Inbox Page</h1>
            {message && <p>{message}</p>}

            {/* pending meeting invitations*/}
            <h2>Pending Meeting Invitations</h2>
                {invites.length == 0 && <p>No pending invitations found!</p>}
                <ul>
                    {invites.map((meeting) => (
                        <li key = {meeting._id}>
                            {meeting.name} | {meeting.room.name} | {meeting.day} | {meeting.start}:00 to {meeting.end}:00
                            <button onClick={() => sendResponse(meeting._id, 'accept')}>Accept</button>
                            <button onClick={() => sendResponse(meeting._id, 'reject')}>Reject</button>
                        </li>
                        ))}
                </ul>
        </div>
        )
}

export default InboxPage