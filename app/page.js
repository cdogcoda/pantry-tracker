'use client';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, query, getDocs, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState('');

  const updatePantry = async () => {
    try {
      const q = query(collection(firestore, 'pantry'));
      const querySnapshot = await getDocs(q);
      const pantryList = [];
      querySnapshot.forEach((doc) => {
        pantryList.push({ name: doc.id, ...doc.data() });
      });
      setPantry(pantryList);
    } catch (error) {
      console.error('Error fetching pantry items:', error);
    }
  };

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await setDoc(docRef, { count: count + 1 });
      } else {
        await setDoc(docRef, { count: 1 });
      }
      await updatePantry();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item);
      const docSnap = await getDoc(docRef);
      const { count } = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, { count: count - 1 });
      } else {
        await deleteDoc(docRef);
      }
      await updatePantry();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  return (
    <Box
      width='100vw'
      height='100vh'
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              variant="outlined"
              label="Item"
              onChange={(e) => setItemName(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>Add</Button>
      <Box border={'2px solid black'}>
        <Box
          width='800px'
          height='100px'
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          bgcolor={'lightblue'}
        >
          <Typography variant={'h2'} fontWeight={'bold'}>
            Pantry Items
          </Typography>
        </Box>
        <Stack
          width='800px'
          height='400px'
          spacing={1}
          overflow={'auto'}
        >
          {pantry.map((i) => (
            <Box
              key={i.name}
              width='100%'
              minHeight='150px'
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              padding={'36px'}
            >
              <Typography variant={'h3'}>
                {i.name.charAt(0).toUpperCase() + i.name.slice(1)}
              </Typography>
              <Typography variant={'h5'}>Quantity: {i.count}</Typography>
              <Button
                variant='contained'
                onClick={() => {
                  removeItem(i.name);
                }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
