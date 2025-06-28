import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  schoolLogo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 10,
    textAlign: 'center',
  },
  remarks: {
    marginTop: 10,
    padding: 10,
    border: 1,
    borderStyle: 'solid',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
});

const ReportCard = ({ student, scores, term, session }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src="/school-logo.png" style={styles.schoolLogo} />
        <View>
          <Text>SKYSOAR INTERNATIONAL SCHOOL ANKA</Text>
          <Text>P.M.B. 1234, Anka, Zamfara State</Text>
          <Text>Email: info@skysoar.edu.ng | Phone: +234 123 456 7890</Text>
        </View>
      </View>

      <Text style={styles.title}>STUDENT'S REPORT CARD</Text>

      <View style={styles.studentInfo}>
        <View>
          <Text>Name: {student.firstName} {student.lastName}</Text>
          <Text>Class: {student.class.name}</Text>
        </View>
        <View>
          <Text>Term: {term.charAt(0).toUpperCase() + term.slice(1)} Term</Text>
          <Text>Session: {session}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Subject</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>CA 1 (20%)</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>CA 2 (20%)</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Exam (60%)</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Total (100%)</Text>
          </View>
        </View>

        {scores.map((score, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>{score.subject.name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>{score.ca1_score || '-'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>{score.ca2_score || '-'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>{score.exam_score || '-'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.bodyText}>{score.total_score || '-'}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.remarks}>
        <Text>Form Teacher's Remarks: _________________________________</Text>
        <Text>Head Teacher's Remarks: _________________________________</Text>
      </View>

      <View style={styles.footer}>
        <View>
          <Text>_________________________________</Text>
          <Text>Form Teacher's Signature</Text>
        </View>
        <View>
          <Text>_________________________________</Text>
          <Text>Head Teacher's Signature</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default ReportCard;