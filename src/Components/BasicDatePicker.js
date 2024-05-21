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
  return dayjs(date).format('MMMM D');
};

const BasicDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [favoriteBirthdays, setFavoriteBirthdays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Adjust as needed

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteBirthdays');
    if (storedFavorites) {
      setFavoriteBirthdays(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteBirthdays', JSON.stringify(favoriteBirthdays));
  }, [favoriteBirthdays]);

  const handleDateChange = async (date) => {
    if (!date) return;
    setSelectedDate(date);

    const month = date.month() + 1;
    const day = date.date();
    const fetchedData = await fetchHistoricalData('en', 'births', month, day);
    if (fetchedData && fetchedData.births) {
      setBirthdays(fetchedData.births);
    } else {
      setBirthdays([]);
    }
  };

  const addToFavorites = (birthday) => {
    const newFavorite = { ...birthday, formattedDate: formatDate(selectedDate) };
    setFavoriteBirthdays((prevFavorites) => [...prevFavorites, newFavorite]);
  };

  const removeFromFavorites = (birthday) => {
    setFavoriteBirthdays((prevFavorites) =>
      prevFavorites.filter((fav) => fav.text !== birthday.text)
    );
  };

  const isFavorite = (birthday) => {
    return favoriteBirthdays.some((fav) => fav.text === birthday.text && fav.formattedDate === formatDate(selectedDate));
  };

  const filteredBirthdays = birthdays.filter((birthday) =>
    birthday.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBirthdays = filteredBirthdays.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="container">
        <Box className="left-content">
          <DemoContainer components={['DatePicker']}>
            <DatePicker
              label="Pick a date"
              value={selectedDate}
              onChange={handleDateChange}
              disableFuture
              maxDate={dayjs()}
            />
          </DemoContainer>
          <Typography variant="h5" gutterBottom>
          Birthdays on {formatDate(selectedDate)} 🎂
          </Typography>
          <Box className="search-container">
            <Typography variant="h6" className="search-label">
              Search
            </Typography>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field"
            />
          </Box>
          <List className="birthday-list">
            {currentBirthdays.map((birthday, index) => (
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
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Prev
            </button>
            <button onClick={nextPage} disabled={indexOfLastItem >= filteredBirthdays.length}>
              Next
            </button>
          </div>
        </Box>
        <Box className="right-content">
          <Typography variant="h5" gutterBottom className="title">
            Favorite Birthdays
          </Typography>
          <Typography variant="h6" gutterBottom className="subtitle">
        {formatDate(selectedDate)} 🎂
          </Typography>
          <List className="favorite-list">
            {favoriteBirthdays.map((birthday, index) => (
              <ListItem key={index} className="favorite-birthday">
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
