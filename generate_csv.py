import csv
import random

def generate_fake_students_csv(filename):
    headers = [
        "Student Name", "Gender", "Class", "Roll Number", "Age",
        "Father Name", "Mother Name", "Contact Number",
        "Admission Number", "Aadhaar Number", "APPAR Number", "Blood Group"
    ]
    
    classes = ["PG", "LKG", "UKG"] + [f"Class {i}" for i in range(1, 13)]
    
    # Fake Indian Names Data
    male_first_names = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Rohan", "Kabir", "Dhruv", "Rishi", "Yash", "Dev", "Krishna", "Rahul", "Amit", "Vikram", "Sanjay", "Rajesh", "Surya", "Karan", "Kunal"]
    female_first_names = ["Aditi", "Riya", "Diya", "Anya", "Ananya", "Myra", "Kiara", "Kavya", "Saanvi", "Aadhya", "Priya", "Neha", "Pooja", "Anjali", "Shruti", "Swati", "Nisha", "Meera", "Zara", "Tara"]
    last_names = ["Sharma", "Verma", "Singh", "Kumar", "Gupta", "Patel", "Mehta", "Jain", "Reddy", "Rao", "Das", "Mukherjee", "Bose", "Ghosh", "Iyer", "Nair", "Pillai", "Chauhan", "Rajput", "Yadav", "Pandey", "Tiwari", "Mishra", "Dubey"]
    blood_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

    def get_age_for_class(cls_name):
        if cls_name == "PG": return random.randint(3, 4)
        if cls_name == "LKG": return random.randint(4, 5)
        if cls_name == "UKG": return random.randint(5, 6)
        if cls_name in ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"]: return random.randint(6, 10)
        if cls_name in ["Class 6", "Class 7", "Class 8"]: return random.randint(11, 13)
        if cls_name in ["Class 9", "Class 10"]: return random.randint(14, 16)
        return random.randint(16, 18) # 11-12

    admission_counter = 10001
    
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        
        for cls_name in classes:
            for roll_no in range(1, 51): # 50 students per class
                gender = random.choice(["Boy", "Girl"])
                last_name = random.choice(last_names)
                
                if gender == "Boy":
                    first_name = random.choice(male_first_names)
                else:
                    first_name = random.choice(female_first_names)
                
                student_name = f"{first_name} {last_name}"
                father_name = f"Mr. {random.choice(male_first_names)} {last_name}"
                mother_name = f"Mrs. {random.choice(female_first_names)} {last_name}"
                
                age = get_age_for_class(cls_name)
                contact_number = f"{random.choice([6, 7, 8, 9])}{random.randint(100000000, 999999999)}"
                admission_number = str(admission_counter)
                admission_counter += 1
                
                aadhaar_number = str(random.randint(100000000000, 999999999999))
                appar_number = str(random.randint(100000000000, 999999999999))
                blood_group = random.choice(blood_groups)
                
                writer.writerow([
                    student_name, gender, cls_name, roll_no, age,
                    father_name, mother_name, contact_number,
                    admission_number, aadhaar_number, appar_number, blood_group
                ])
                
    print(f"Successfully generated {filename} with {(admission_counter - 10001)} records.")

if __name__ == "__main__":
    generate_fake_students_csv("fake_school_students_pg_to_12.csv")
