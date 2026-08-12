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

    //transfers of ownership
    const[transfers, setTransfers] = useState([])

    const headers = {
        'Content-Type' : 'application/json',
        Authorization: 'Bearer ' + (user ? user.token : '')
        }

    // get transfer requests
    function fetchTransfers(){
        fetch('http://localhost:3000/meetings?transfers=true', {headers: headers})
        .then((res) => res.json())
        .then(setTransfers)
        .catch(() => setMessage('Error, could not load transfer requests'))
        }

    // Accept or reject transfers, similar to invite responses.
    async function sendTransferResponse(id, answer){
        const res = await fetch('http://localhost:3000/meetings/'+ id + '/transfer/' + answer, {
            method: 'POST',
            headers: headers
            })

        const info = await res.json()
        setMessage(info.message)
        fetchTransfers() // update,removed from list
        }

    function fetchInvites(){
        fetch('http://localhost:3000/meetings?inbox=true', {headers: headers})
        .then((res) => res.json())
        .then(setInvites)
        .catch(() => setMessage('Error, could not load invites'))
        }

    // get invites/transfers, populate
    useEffect(() =>{
        fetchInvites()
        fetchTransfers()
        }, [])

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
                            {meeting.name} | {meeting.room.name} | {meeting.day} | {meeting.start}:00 to {meeting.end}:00 |
                            <button onClick={() => sendResponse(meeting._id, 'accept')}>Accept</button>
                            <button onClick={() => sendResponse(meeting._id, 'reject')}>Reject</button>
                        </li>
                        ))}
                </ul>
                {/* Transfer Ownership requests,virtually similar to meeting invitations */}
            <h2>Pending Ownership Transfer Requests</h2>
                {transfers.length == 0 && <p>No pending transfer requests found!</p>}
                <ul>
                    {transfers.map((meeting) => (
                        <li key = {meeting._id}>
                            {meeting.name} | {meeting.room.name} | {meeting.day} | {meeting.start}:00 to {meeting.end}:00 |
                            <button onClick={() => sendTransferResponse(meeting._id, 'accept')}>Accept Transfer</button>
                            <button onClick={() => sendTransferResponse(meeting._id, 'reject')}>Reject Transfer</button>
                        </li>
                        ))}
                </ul>
        </div>
        )
}

export default InboxPage