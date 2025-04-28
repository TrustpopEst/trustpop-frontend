"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isAddingEvent, setIsAddingEvent] = useState(false); // Toggle to show the Add Event form
  const [editingEventId, setEditingEventId] = useState<string | null>(null); // For tracking the event being edited
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); // Not logged in? Redirect to login
      } else {
        setUser(user);
        fetchUserEvents(user.id); // Fetch events after user is fetched
      }
    };
    getUser();
  }, [router]);

  // Fetch events for logged-in user
  const fetchUserEvents = async (userId: string) => {
    const { data: eventsData, error } = await supabase
      .from('events')
      .select('id, title, description') // Ensure title and description are selected
      .eq('user_id', userId);
  
    if (error) {
      console.log("Error fetching events: ", error);
    } else {
      console.log("Fetched events: ", eventsData);
      setEvents(eventsData); // Update the events list
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/logged-out');
  };

  // Handle adding new event
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!eventName || !eventDescription) {
      alert('Please fill in all fields!');
      return;
    }
  
    console.log("Adding event: ", {
      user_id: user.id,
      title: eventName,  // Event name will be inserted into the 'title' column (YELLOW)
      description: eventDescription, // Event description will be inserted into the 'description' column (YELLOW)
    });
  
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          user_id: user.id,
          title: eventName,  // Insert event name into 'title' column (YELLOW)
          description: eventDescription, // Insert event description into 'description' column (YELLOW)
        },
      ]);
  
    if (error) {
      console.log("Error adding event: ", error);
    } else {
      console.log("Event added: ", data);
      setEventName('');
      setEventDescription('');
      setIsAddingEvent(false); // Close the form
      fetchUserEvents(user.id); // Refresh event list (YELLOW)
    }
  };

  // Handle editing an existing event
  const handleEditEvent = (event: any) => {
    setEditingEventId(event.id);
    setEventName(event.title); // YELLOW: Change `event.name` to `event.title` (for consistency with column name)
    setEventDescription(event.description || '');
    setIsAddingEvent(true);
  };

  // Save edited event
  const handleSaveEditedEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDescription) {
      alert('Please fill in all fields!');
      return;
    }
  
    const { data, error } = await supabase
      .from('events')
      .update({
        title: eventName, // YELLOW: Change `name` to `title`
        description: eventDescription,
      })
      .eq('id', editingEventId);
  
    if (error) {
      console.log("Error editing event: ", error);  // Log any error that occurs
    } else {
      console.log("Event updated: ", data); // Log the updated event data after it is successfully updated
      setEventName('');
      setEventDescription('');
      setIsAddingEvent(false); // Close the form
      setEditingEventId(null); // Clear editing state
      fetchUserEvents(user.id); // Refresh the events list after the update (YELLOW)
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.log("Error deleting event: ", error);
    } else {
      fetchUserEvents(user.id); // Refresh the events list (YELLOW)
    }
  };

  // Handle copy event link to clipboard
  const handleCopyLink = (eventId: string) => {
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(eventUrl).then(() => {
      alert('Event link copied to clipboard!');
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <img
            src="/trustpoplogo.svg"
            alt="TrustPop Logo"
            style={{
              height: '80px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '0.5rem' }}>
            Logged in as: {user?.username || user?.email}
          </p>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1.2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '1rem', textAlign: 'center' }}>Welcome to TrustPop 🎉</h1>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '18px' }}>Manage your TrustPop events below.</p>
      </div>

      {/* Manage Events List */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '1rem' }}>Your Events</h2>
        {events.length > 0 ? (
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', fontSize: '18px' }}>
            {events.map((event) => (
              <li key={event.id}>
                <strong>{event.title}</strong> {/* YELLOW: Display event title */}
                <p>{event.description || 'No description'}</p> {/* YELLOW: Display event description */}
                <button
                  onClick={() => handleEditEvent(event)}
                  style={{ marginTop: '0.5rem', backgroundColor: '#6366f1', color: 'white', padding: '0.5rem', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Edit Event
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  style={{ marginTop: '0.5rem', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}
                >
                  Delete Event
                </button>
                <button
                  onClick={() => handleCopyLink(event.id)}
                  style={{ marginTop: '0.5rem', backgroundColor: '#4CAF50', color: 'white', padding: '0.5rem', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}
                >
                  Copy Event Link
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found. Click below to add your first event.</p>
        )}

        {/* Add Event Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          {!isAddingEvent ? (
            <button
              onClick={() => setIsAddingEvent(true)}
              style={{
                backgroundColor: '#6366f1',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Add New Event
            </button>
          ) : (
            <form onSubmit={editingEventId ? handleSaveEditedEvent : handleAddEvent} style={{ textAlign: 'center', marginTop: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label>Event Description</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  required
                  style={{ ...inputStyle, height: '100px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#6366f1',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {editingEventId ? 'Save Event' : 'Save New Event'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '16px'
};