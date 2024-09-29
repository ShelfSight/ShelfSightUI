import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, Typography, Grid, Container, TextField, Box } from '@mui/material';
import './App.css';


function App() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [products, setProducts] = useState([]);
  const [video, setVideo] = useState(null);
  const [uploadedVideoURL, setUploadedVideoURL] = useState(null);

  useEffect(() => {
    // Fetch available cameras
    axios.get('http://localhost:5000/cameras').then((response) => {
      setCameras(response.data.cameras);
    });

    // Fetch detected products from the database
    axios.get('http://localhost:5000/products').then((response) => {
      setProducts(response.data);
    });
  }, []);

  const handleCameraSelect = (camera) => {
    setSelectedCamera(camera);
    // Logic to start capturing from the selected camera
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    setVideo(file);

    const formData = new FormData();
    formData.append('file', file);

    axios
      .post('http://localhost:5000/upload_video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        console.log(response.data);
        setUploadedVideoURL(URL.createObjectURL(file)); // Store the URL for preview
      });
  };

  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom>
        ShelfSight - Real-time Shelf Stock Detection
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button variant="contained" component="label" style={{ marginRight: '20px' }}>
          Upload Video
          <input hidden accept="video/*" type="file" onChange={handleVideoUpload} />
        </Button>

        <TextField
          select
          label="Select a Camera"
          SelectProps={{ native: true }}
          variant="outlined"
          onChange={(e) => handleCameraSelect(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">Select a Camera</option>
          {cameras.map((camera, index) => (
            <option key={index} value={camera}>
              Camera {camera}
            </option>
          ))}
        </TextField>
      </Box>

      {uploadedVideoURL && (
        <Box mt={4} mb={4} display="flex" justifyContent="center">
          <video controls style={{ maxWidth: '100%', maxHeight: '500px' }}>
            <source src={uploadedVideoURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      )}

      <Typography variant="h4" gutterBottom>
        Detected Products
      </Typography>

      <Grid container spacing={4}>
        {products.map((product, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card>
              <CardContent>
                <img
                  src={`data:image/jpeg;base64,${product[1]}`}
                  alt="product"
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <Typography variant="h6">{product[3]}</Typography>
                <Typography variant="body2">Label: {product[2]}</Typography>
                <Typography variant="body2">Confidence: {product[4]}</Typography>
                <Typography variant="body2" color={product[5] ? 'error' : 'primary'}>
                  {product[5] ? 'Missing' : 'In Stock'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;
