import React, { useState, useEffect } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Box, Typography, List, ListItem, ListItemText, TextField, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import './styles.css'; // Ensure you have the correct styles imported

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
  return dayjs(date).format('MMMM D'); // Format date to show month name and day
};

const BasicDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [favoriteBirthdays, setFavoriteBirthdays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteBirthdays');
    if (storedFavorites) {
      setFavoriteBirthdays(JSON.parse(storedFavorites));
    }
  }, []);



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
    const newFavorite = { ...birthday, formattedDate };
    setFavoriteBirthdays((prevFavorites) => [...prevFavorites, newFavorite]);
  };

  const removeFromFavorites = (birthday) => {
    setFavoriteBirthdays((prevFavorites) =>
      prevFavorites.filter((fav) => fav.text !== birthday.text)
    );
  };

  const isFavorite = (birthday) => {
    return favoriteBirthdays.some((fav) => fav.text === birthday.text && fav.formattedDate === formattedDate);
  };

  const filteredBirthdays = birthdays.filter((birthday) =>
    birthday.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const firstBirthday = filteredBirthdays.length > 0 ? filteredBirthdays[0] : null;
  const remainingBirthdays = filteredBirthdays.slice(1);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="container">
        <Box className="left-content">
          <DemoContainer components={['DatePicker']}>
            <DatePicker
              label="Pick a date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </DemoContainer>
          <Typography variant="h5" gutterBottom>
            Birthdays on {formattedDate}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Search
          </Typography>
          <TextField
            label="Search"
            variant="outlined"
            size="small" // smaller search bar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
          />
          <List>
            {firstBirthday && (
              <ListItem key="first" sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 'small' }}>
                <IconButton
                  onClick={() =>
                    isFavorite(firstBirthday) ? removeFromFavorites(firstBirthday) : addToFavorites(firstBirthday)
                  }
                >
                  {isFavorite(firstBirthday) ? <StarIcon color="primary" /> : <StarBorderIcon />}
                </IconButton>
                <ListItemText primary={`${firstBirthday.text}`} />
              </ListItem>
            )}
            {remainingBirthdays.map((birthday, index) => (
              <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 'small' }}>
                <IconButton
                  onClick={() =>
                    isFavorite(birthday) ? removeFromFavorites(birthday) : addToFavorites(birthday)
                  }
                >
                  {isFavorite(birthday) ? <StarIcon color="primary" /> : <StarBorderIcon />}
                </IconButton>
                <ListItemText primary={`${birthday.text}`} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box className="right-content">
          <Typography variant="h5" gutterBottom>
            Favorite Birthdays
          </Typography>
          <Typography variant="h6" gutterBottom>
            {formattedDate}
          </Typography>
          <List>
            {favoriteBirthdays.map((birthday, index) => (
              <ListItem key={index} sx={{ fontSize: 'small' }}>
                <ListItemText
                  primary={
                    <>
                      <span className="bold-text">{birthday.text.split(' - ')[0]}</span> 
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
