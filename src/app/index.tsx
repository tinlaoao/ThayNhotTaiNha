import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

const OILS_DATA = {
  engineOil: [
    { id: 'e1', name: 'Castrol Power1 Ultimate 10W40', price: 180000 },
    { id: 'e2', name: 'Motul 300V Factory Line 10W40', price: 420000 },
    { id: 'e3', name: 'Shell Advance Ultra 4T 10W40', price: 210000 },
    { id: 'e4', name: 'Yamalube 4T Semi-Synthetic', price: 120000 },
  ],
  gearOil: [
    { id: 'g1', name: 'Motul Scooter Gear Box Oil', price: 55000 },
    { id: 'g2', name: 'Castrol Scooter Gear Oil', price: 45000 },
    { id: 'g3', name: 'Shell Advance Scooter Gear', price: 50000 },
  ]
};

const LABOR_FEE = 50000; 
const TRAVEL_FEE = 30000; 
const TAX_RATE = 0.1; 

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'customer_dashboard' | 'staff_dashboard'>('auth');
  const [role, setRole] = useState<'customer' | 'staff'>('customer');
  
  const [vehicleCount, setVehicleCount] = useState(1);
  const [selectedEngineOil, setSelectedEngineOil] = useState(OILS_DATA.engineOil[0]);
  const [selectedGearOil, setSelectedGearOil] = useState(OILS_DATA.gearOil[0]);
  const [bookingTime, setBookingTime] = useState('Sau 1 tiếng 15 phút nữa');
  
  const [orderStatus, setOrderStatus] = useState<'idle' | 'waiting_staff' | 'staff_accepted' | 'completed'>('idle');
  const [countdown, setCountdown] = useState(300); 
  const [assignedStaff, setAssignedStaff] = useState<any>(null);

  const [isWorking, setIsWorking] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [availableOrders, setAvailableOrders] = useState([
    {
      id: 'ord_1',
      customerName: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Nguyễn Xí, Bình Thạnh, TP.HCM',
      distance: '3.5 km',
      vehicleCount: 1,
      oilDetails: 'Castrol Power1 + Motul Gear',
      totalPrice: 285000,
      rejectedByFirstStaff: false,
    }
  ]);

  useEffect(() => {
    let timer: any;
    if (orderStatus === 'waiting_staff' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && orderStatus === 'waiting_staff') {
      setOrderStatus('idle');
      Alert.alert('Thông báo', 'Không tìm thấy thợ nhận đơn trong khung giờ này!');
    }
    return () => clearInterval(timer);
  }, [orderStatus, countdown]);

  const calculateTotal = () => {
    const oilSubtotal = (selectedEngineOil.price + selectedGearOil.price) * vehicleCount;
    const laborSubtotal = LABOR_FEE * vehicleCount;
    const rawTotal = oilSubtotal + laborSubtotal + TRAVEL_FEE;
    const tax = rawTotal * TAX_RATE;
    return Math.round(rawTotal + tax);
  };

  const handlePlaceOrder = () => {
    setOrderStatus('waiting_staff');
    setCountdown(300);
    Alert.alert('Đã gửi đơn', 'Hệ thống đang tìm thợ trong bán kính <=10km...');
  };

  const handleAcceptOrder = (order: any) => {
    setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
    setAssignedStaff({
      name: 'Trần Văn Thợ',
      phone: '0988776655',
      licensePlate: '59-F1 123.45',
      distance: order.distance
    });
    setOrderStatus('staff_accepted');
  };

  const handleRejectOrder = (order: any) => {
    if (order.rejectedByFirstStaff) {
      Alert.alert('Bị khoá', 'Đơn hàng này đã bị từ chối 1 lần, không thể từ chối nữa!');
      return;
    }
    setAvailableOrders(prev => prev.map(o => o.id === order.id ? { ...o, rejectedByFirstStaff: true } : o));
    Alert.alert('Đã từ chối', 'Đơn hàng đã chuyển cho thợ khác.');
  };

  return (
    <ScrollView style={styles.container}>
      {currentScreen === 'auth' && (
        <View style={styles.authContainer}>
          <Text style={styles.mainTitle}>Thay Nhớt Tại Nhà</Text>
          <View style={styles.roleTab}>
            <TouchableOpacity 
              style={[styles.tabBtn, role === 'customer' && styles.activeTab]} 
              onPress={() => setRole('customer')}
            >
              <Text style={[styles.tabText, role === 'customer' && styles.activeTabText]}>Khách Hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, role === 'staff' && styles.activeTab]} 
              onPress={() => setRole('staff')}
            >
              <Text style={[styles.tabText, role === 'staff' && styles.activeTabText]}>Nhân Viên Thợ</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder="Email hoặc Số điện thoại" placeholderTextColor="#888" />
          <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor="#888" secureTextEntry />

          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => setCurrentScreen(role === 'customer' ? 'customer_dashboard' : 'staff_dashboard')}
          >
            <Text style={styles.btnText}>Đăng Nhập / Đăng Ký</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentScreen === 'customer_dashboard' && (
        <View style={styles.dashboard}>
          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>Dịch vụ Thay Nhớt Tại Nhà</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('auth')}>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          {orderStatus === 'idle' && (
            <View style={styles.card}>
              <Text style={styles.label}>1. Chọn số lượng xe:</Text>
              <View style={styles.row}>
                {[1, 2, 3, 4].map(num => (
                  <TouchableOpacity 
                    key={num} 
                    style={[styles.numBtn, vehicleCount === num && styles.activeNum]}
                    onPress={() => setVehicleCount(num)}
                  >
                    <Text style={styles.numText}>{num} Xe</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>2. Chọn Nhớt Máy:</Text>
              {OILS_DATA.engineOil.map(oil => (
                <TouchableOpacity 
                  key={oil.id} 
                  style={[styles.optionItem, selectedEngineOil.id === oil.id && styles.selectedOption]}
                  onPress={() => setSelectedEngineOil(oil)}
                >
                  <Text style={styles.optionText}>{oil.name}</Text>
                  <Text style={styles.priceText}>{oil.price.toLocaleString()}đ</Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.label}>3. Chọn Nhớt Hộp Số:</Text>
              {OILS_DATA.gearOil.map(oil => (
                <TouchableOpacity 
                  key={oil.id} 
                  style={[styles.optionItem, selectedGearOil.id === oil.id && styles.selectedOption]}
                  onPress={() => setSelectedGearOil(oil)}
                >
                  <Text style={styles.optionText}>{oil.name}</Text>
                  <Text style={styles.priceText}>{oil.price.toLocaleString()}đ</Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.label}>4. Thời gian đặt (Tối thiểu cách 1 tiếng 5 phút):</Text>
              <TextInput style={styles.input} value={bookingTime} onChangeText={setBookingTime} />

              <View style={styles.billBox}>
                <Text style={styles.billTitle}>Bảng kê chi phí tạm tính:</Text>
                <Text style={styles.billText}>- Nhớt & Công thợ ({vehicleCount} xe): {((selectedEngineOil.price + selectedGearOil.price + LABOR_FEE) * vehicleCount).toLocaleString()}đ</Text>
                <Text style={styles.billText}>- Phí di chuyển: {TRAVEL_FEE.toLocaleString()}đ</Text>
                <Text style={styles.billText}>- Thuế VAT (10%): {(((selectedEngineOil.price + selectedGearOil.price + LABOR_FEE) * vehicleCount + TRAVEL_FEE) * TAX_RATE).toLocaleString()}đ</Text>
                <Text style={styles.totalBillText}>TỔNG CỘNG: {calculateTotal().toLocaleString()}đ</Text>
              </View>

              <TouchableOpacity style={styles.orderBtn} onPress={handlePlaceOrder}>
                <Text style={styles.orderBtnText}>GỌI THỢ THAY NHỚT NGAY</Text>
              </TouchableOpacity>
            </View>
          )}

          {orderStatus === 'waiting_staff' && (
            <View style={styles.waitingCard}>
              <Text style={styles.waitingTitle}>Đang tìm thợ gần bạn...</Text>
              <Text style={styles.countdownText}>Thời gian chờ: {Math.floor(countdown / 60)}:{(countdown % 60 < 10 ? '0' : '') + (countdown % 60)}</Text>
            </View>
          )}

          {orderStatus === 'staff_accepted' && assignedStaff && (
            <View style={styles.acceptedCard}>
              <Text style={styles.successTitle}>Thợ đã nhận đơn hàng!</Text>
              <View style={styles.staffInfoBox}>
                <Text style={styles.infoText}>Thợ: {assignedStaff.name}</Text>
                <Text style={styles.infoText}>Biển số xe: {assignedStaff.licensePlate}</Text>
                <Text style={styles.infoText}>Khoảng cách: {assignedStaff.distance}</Text>
              </View>
              <View style={styles.mapMockup}>
                <Text style={styles.mapText}>[BẢN ĐỒ ĐỊNH VỊ THỢ]</Text>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.actionCall} onPress={() => Alert.alert('Gọi', `Đang gọi ${assignedStaff.phone}`)}>
                  <Text style={styles.btnText}>Gọi Thoại</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionChat} onPress={() => Alert.alert('Nhắn tin', 'Mở chat')}>
                  <Text style={styles.btnText}>Nhắn Tin</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {currentScreen === 'staff_dashboard' && (
        <View style={styles.dashboard}>
          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>Khu Vực Nhân Viên Thợ</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('auth')}>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Trạng thái ca làm:</Text>
              <TouchableOpacity 
                style={[styles.shiftBtn, isWorking ? styles.endShift : styles.startShift]}
                onPress={() => setIsWorking(!isWorking)}
              >
                <Text style={styles.btnText}>{isWorking ? 'Kết Thúc Ca' : 'Bắt Đầu Vào Ca'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.earningText}>Tổng tiền hôm nay: {todayEarnings.toLocaleString()}đ</Text>
          </View>

          {isWorking ? (
            <View>
              <Text style={styles.sectionTitle}>Các cuốc xe gần bạn (&lt;= 10km):</Text>
              {availableOrders.length === 0 ? (
                <Text style={styles.subText}>Chưa có đơn hàng mới.</Text>
              ) : (
                availableOrders.map(ord => (
                  <View key={ord.id} style={styles.orderCard}>
                    <Text style={styles.orderHeader}>Khách: {ord.customerName} - {ord.distance}</Text>
                    <Text style={styles.infoText}>Địa chỉ: {ord.address}</Text>
                    <Text style={styles.infoText}>SĐT: {ord.phone}</Text>
                    <Text style={styles.infoText}>Chi tiết: {ord.vehicleCount} xe ({ord.oilDetails})</Text>
                    <Text style={styles.moneyText}>Tiền thu: {ord.totalPrice.toLocaleString()}đ</Text>

                    <View style={styles.row}>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => { handleAcceptOrder(ord); setTodayEarnings(prev => prev + ord.totalPrice); }}>
                        <Text style={styles.btnText}>Chấp Nhận</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.rejectBtn, ord.rejectedByFirstStaff && styles.disabledBtn]} 
                        onPress={() => handleRejectOrder(ord)}
                      >
                        <Text style={styles.btnText}>{ord.rejectedByFirstStaff ? 'Đã khoá từ chối' : 'Từ Chối'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : (
            <View style={styles.offlineBox}>
              <Text style={styles.subText}>Bạn đang OFF. Bấm "Bắt Đầu Vào Ca" để nhận đơn.</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 15 },
  authContainer: { flex: 1, justifyContent: 'center', marginTop: 100 },
  mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 30 },
  roleTab: { flexDirection: 'row', backgroundColor: '#1e1e1e', borderRadius: 8, marginBottom: 20, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  primaryBtn: { backgroundColor: '#22c55e', padding: 15, borderRadius: 8, alignItems: 'center' },
  dashboard: { flex: 1, marginTop: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  logoutText: { color: '#ef4444', fontWeight: 'bold' },
  card: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 12, marginBottom: 20 },
  label: { color: '#bbb', fontWeight: '600', marginTop: 10, marginBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numBtn: { flex: 1, backgroundColor: '#2a2a2a', padding: 10, alignItems: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#444' },
  activeNum: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  numText: { color: '#fff', fontWeight: 'bold' },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#2a2a2a', padding: 12, borderRadius: 6, marginBottom: 6 },
  selectedOption: { borderColor: '#22c55e', borderWidth: 2 },
  optionText: { color: '#fff', flex: 1, fontSize: 13 },
  priceText: { color: '#f59e0b', fontWeight: 'bold' },
  billBox: { backgroundColor: '#262626', padding: 12, borderRadius: 8, marginTop: 15 },
  billTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  billText: { color: '#aaa', fontSize: 13, marginBottom: 3 },
  totalBillText: { color: '#22c55e', fontWeight: 'bold', fontSize: 16, marginTop: 8 },
  orderBtn: { backgroundColor: '#f59e0b', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  orderBtnText: { color: '#121212', fontWeight: 'bold', fontSize: 16 },
  waitingCard: { backgroundColor: '#1e293b', padding: 25, borderRadius: 12, alignItems: 'center' },
  waitingTitle: { color: '#38bdf8', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  countdownText: { color: '#f59e0b', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  acceptedCard: { backgroundColor: '#064e3b', padding: 20, borderRadius: 12 },
  successTitle: { color: '#34d399', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  staffInfoBox: { backgroundColor: '#022c22', padding: 12, borderRadius: 8, marginBottom: 15 },
  infoText: { color: '#fff', marginBottom: 5, fontSize: 14 },
  mapMockup: { backgroundColor: '#111827', height: 120, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 15 },
  mapText: { color: '#9ca3af', fontWeight: 'bold' },
  actionCall: { flex: 1, backgroundColor: '#3b82f6', padding: 12, alignItems: 'center', borderRadius: 6 },
  actionChat: { flex: 1, backgroundColor: '#8b5cf6', padding: 12, alignItems: 'center', borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  shiftBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 6 },
  startShift: { backgroundColor: '#22c55e' },
  endShift: { backgroundColor: '#ef4444' },
  earningText: { color: '#f59e0b', fontSize: 15, fontWeight: 'bold', marginTop: 15 },
  sectionTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  subText: { color: '#888', fontStyle: 'italic' },
  orderCard: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  orderHeader: { color: '#38bdf8', fontWeight: 'bold', marginBottom: 8 },
  moneyText: { color: '#22c55e', fontWeight: 'bold', marginTop: 8, marginBottom: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#22c55e', padding: 10, alignItems: 'center', borderRadius: 6 },
  rejectBtn: { flex: 1, backgroundColor: '#ef4444', padding: 10, alignItems: 'center', borderRadius: 6 },
  disabledBtn: { backgroundColor: '#555' },
  offlineBox: { padding: 30, alignItems: 'center' }
});