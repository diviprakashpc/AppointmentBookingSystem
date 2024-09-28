const CANCELLED = 'Cancelled'
const BOOKED = 'Booked'
function timeToMinutes(timeString) { // Helper for hh:mm time.
    const [hours, minutes] = timeString.split(':').map(Number);
    console.log(hours + " HOURS ," + minutes +" MINUTES ");
    return hours * 60 + minutes;
  }

function minutesToTime(n){
  let num = n;
  let hours = (num / 60);
  let rhours = Math.floor(hours);
  let minutes = (hours - rhours) * 60;
  let rminutes = Math.round(minutes);
  return rhours + ":" + rminutes;
}

const ValidateBody = (inputs) => {
    const invalidInput = inputs.some((input) => !input || inputs.length <= 0)
    return !invalidInput;
}



async function insertSampleData() {
  try {
   
    const sampleDoctors = [
      new Doctor({ 
        name: "Dr. Divya Prakash", 
        email: "diviprakashpc@example.com", 
        specialization:"Oncology"
      }),
      new Doctor({ 
        name: "Dr. Sejal Nayak", 
        email: "sejalnayak2001@example.com", 
        specialization: "Neurology"
      })
    ];
    await Doctor.insertMany(sampleDoctors);

    // Insert Sample Patients
    const samplePatients =  [
      {
        "name": "Abhinav Shukla",
        "email": "abhinavshukla@example.com"
      },
      {
        "name": "Yash Raman Gupta",
        "email": "yashramangupta@example.com"
      },
      {
        "name": "Roshan Singh",
        "email": "roshansingh@example.com"
      },
      {
        "name": "Murli Krishma",
        "email": "murlikrishma@gexamplemail.com"
      },
      {
        "name": "Amit Singh",
        "email": "amitsingh@example.com"
      }
    ];
    await Patient.insertMany(samplePatients);

    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

module.exports = { BOOKED, CANCELLED, timeToMinutes, ValidateBody, insertSampleData, minutesToTime }