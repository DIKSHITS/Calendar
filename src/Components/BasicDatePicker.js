import React, { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Box, Typography, List, ListItem, ListItemText, TextField, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import './styles.css'; // Updated to reference the correct CSS file

// Function to fetch historical data for a given date
const fetchHistoricalData = async (language, type, month, day) => {
  const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/${type}/${month}/${day}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
  }
};

const formatDate = (date) => {
  const dt = dayjs(date);
  const month = dt.month() + 1;
  const year = dt.year();
  return `${month}/${year}`;
};

const BasicDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [favoriteBirthdays, setFavoriteBirthdays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDateChange = async (date) => {
    if (!date) return;
    setSelectedDate(date);

    const month = date.month() + 1;
    const day = date.date();
    const fetchedData = await fetchHistoricalData('en', 'births', month, day);
    if (fetchedData && fetchedData.births) {
      setBirthdays(fetchedData.births);
      console.log('API Response Data:', fetchedData);
    } else {
      setBirthdays([]);
    }
  };

  const formattedDate = selectedDate ? formatDate(selectedDate) : '';

  const addToFavorites = (birthday) => {
    setFavoriteBirthdays((prevFavorites) => [...prevFavorites, birthday]);
  };

  const removeFromFavorites = (birthday) => {
    setFavoriteBirthdays((prevFavorites) =>
      prevFavorites.filter((fav) => fav.text !== birthday.text)
    );
  };

  const isFavorite = (birthday) => {
    return favoriteBirthdays.some((fav) => fav.text === birthday.text);
  };

  const filteredBirthdays = birthdays.filter((birthday) =>
    birthday.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="container">
        <DemoContainer components={['DatePicker']}>
          <DatePicker
            label="Pick a date"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </DemoContainer>
        <Box className="content-box">
          <TextField
            label="Search Birthdays"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
          />
          <Typography variant="h5" gutterBottom>
            Birthdays on {formattedDate}
          </Typography>
          <List>
            {filteredBirthdays.map((birthday, index) => (
              <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText primary={`${birthday.text} - ${birthday.year}`} />
                <IconButton
                  onClick={() =>
                    isFavorite(birthday) ? removeFromFavorites(birthday) : addToFavorites(birthday)
                  }
                >
                  {isFavorite(birthday) ? <StarIcon color="primary" /> : <StarBorderIcon />}
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box className="content-box">
          <Typography variant="h5" gutterBottom>
            Favorite Birthdays
          </Typography>
          <List>
            {favoriteBirthdays.map((birthday, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <>
                      <span className="bold-text">{birthday.text.split(' - ')[0]}</span> - {birthday.year}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default BasicDatePicker;
