import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

// --- MOCK DATABASE ---
let globalUsers: any[] = [];
let globalOrders: any[] = [];

// --- DỮ LIỆU CẤU HÌNH ---
const HCM_DATA: Record<string, string[]> = {
  "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao", "Phường Phạm Ngũ Lão"],
  "Bình Thạnh": ["Phường 25", "Phường 26", "Phường 27", "Phường 28"],
  "TP. Thủ Đức": ["Phường Thảo Điền", "Phường An Phú", "Phường Hiệp Bình Chánh", "Phường Linh Trung"],
  "Quận Gò Vấp": ["Phường 1", "Phường 3", "Phường 5", "Phường 10"]
};

const DATES = ['Hôm nay\n12/09', 'Ngày mai\n13/09', 'T2\n14/09', 'T3\n15/09'];
const ENGINE_OILS = [
  { id: 'e1', name: 'Castrol Power1 10W40', price: 180000 },
  { id: 'e2', name: 'Motul 300V Factory', price: 420000 },
  { id: 'e3', name: 'Shell Advance Ultra', price: 210000 },
];
const GEAR_OILS = [
  { id: 'g1', name: 'Motul Scooter Gear', price: 55000 },
  { id: 'g2', name: 'Castrol Scooter Gear', price: 45000 },
];

const LABOR_FEE = 50000;
const TRAVEL_FEE = 30000;
const TAX_RATE = 0.1;
const APP_FEE_PERCENT = 0.2; 

export default function App() {
  const [forceRender, setForceRender] = useState(0);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'staff'>('customer');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [cccdInput, setCccdInput] = useState('');
  const [plateInput, setPlateInput] = useState('');

  const [currentTab, setCurrentTab] = useState<'home' | 'history'>('home');
  const [step, setStep] = useState<'booking_form' | 'vehicle_details' | 'tracking_order'>('booking_form');
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  const [totalVehicles, setTotalVehicles] = useState(1);
  const [vehicleList, setVehicleList] = useState<any[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [tempBrand, setTempBrand] = useState('Honda AirBlade');
  const [tempEngineOil, setTempEngineOil] = useState<any>(null);
  const [tempGearOil, setTempGearOil] = useState<any>(null);

  const [isWorking, setIsWorking] = useState(false);
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [showVATModal, setShowVATModal] = useState(false);
  const [vatOrderData, setVatOrderData] = useState<any>(null);
  const [countdown, setCountdown] = useState(300);

  const validatePhone = (p: string) => /^[0-9]{10}$/.test(p);
  const handleAuthSubmit = () => {
    if (!phoneInput) { Alert.alert('Lỗi', 'Số điện thoại không được để trống!'); return; }
    if (!validatePhone(phoneInput)) { Alert.alert('Lỗi', 'Số điện thoại phải đúng 10 chữ số!'); return; }
    if (!passwordInput) { Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu!'); return; }

    if (authMode === 'register') {
      if (!nameInput) { Alert.alert('Lỗi', 'Vui lòng nhập Họ Tên!'); return; }
      if (role === 'staff' && (!cccdInput || !plateInput)) {
        Alert.alert('Lỗi', 'Thợ bắt buộc nhập CCCD và Biển số xe!'); return;
      }
      if (globalUsers.find(u => u.phone === phoneInput)) {
        Alert.alert('Lỗi', 'Số điện thoại đã được đăng ký!'); return;
      }
      globalUsers.push({ phone: phoneInput, password: passwordInput, role, name: nameInput, cccd: cccdInput, plate: plateInput });
      Alert.alert('Thành công', 'Đăng ký thành công! Hãy đăng nhập.');
      setAuthMode('login');
    } else {
      const user = globalUsers.find(u => u.phone === phoneInput && u.role === role);
      if (!user) { Alert.alert('Lỗi', 'Tài khoản chưa đăng ký hoặc sai vai trò!'); return; }
      if (user.password !== passwordInput) { Alert.alert('Lỗi', 'Sai mật khẩu!'); return; }
      
      setCurrentUser(user);
      if (user.role === 'customer') {
        setCustomerName(user.name); setCustomerPhone(user.phone);
      }
    }
  };

  useEffect(() => {
    const isToday = selectedDate.includes('Hôm nay');
    const slots: string[] = [];
    const startHour = isToday ? 12 : 8; 
    for(let i = startHour; i <= 17; i++) slots.push(`${i}:00 - ${i+1}:00`);
    setAvailableTimes(slots);
    setSelectedTime(slots[0]);
  }, [selectedDate]);

  const myActiveCustomerOrder = globalOrders.find(o => o.customerPhone === currentUser?.phone && o.status !== 'completed' && o.status !== 'cancelled');
  const myActiveStaffOrder = globalOrders.find(o => o.staffPhone === currentUser?.phone && o.status !== 'completed' && o.status !== 'cancelled');

  useEffect(() => {
    let timer: any;
    if (myActiveCustomerOrder?.status === 'pending' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && myActiveCustomerOrder?.status === 'pending') {
      myActiveCustomerOrder.status = 'cancelled';
      setForceRender(p=>p+1);
      setStep('booking_form');
      Alert.alert('Hết giờ', 'Không có thợ nhận đơn. Tặng bạn mã giảm giá 10% cho lần sau!');
    }
    return () => clearInterval(timer);
  }, [myActiveCustomerOrder, countdown]);

  const handleProceedToVehicleConfig = () => {
    if (!customerName || !validatePhone(customerPhone)) { Alert.alert('Lỗi', 'SĐT và Họ tên không hợp lệ!'); return; }
    if (!streetAddress || !selectedDistrict || !selectedWard) { Alert.alert('Lỗi', 'Thiếu địa chỉ chi tiết!'); return; }
    setVehicleList([]); setCurrentConfigIndex(0);
    setTempBrand('Honda AirBlade'); setTempEngineOil(null); setTempGearOil(null);
    setStep('vehicle_details');
  };

  const handleSaveCurrentVehicle = () => {
    if (!tempEngineOil && !tempGearOil) {
      Alert.alert('Bỏ qua xe', `Xe số ${currentConfigIndex + 1} không chọn loại nhớt, sẽ bị hủy.`);
    } else {
      setVehicleList(prev => [...prev, { id: currentConfigIndex + 1, brand: tempBrand, engineOil: tempEngineOil, gearOil: tempGearOil }]);
    }
    if (currentConfigIndex + 1 < totalVehicles) {
      setCurrentConfigIndex(prev => prev + 1);
      setTempBrand('Yamaha Exciter'); setTempEngineOil(null); setTempGearOil(null);
    } else {
      const fullAddress = `${streetAddress}, ${selectedWard}, ${selectedDistrict}, TP.HCM`;
      let grossPrice = vehicleList.reduce((acc, v) => acc + (v.engineOil?.price||0) + (v.gearOil?.price||0) + LABOR_FEE, 0) + TRAVEL_FEE;
      const finalPrice = grossPrice + (grossPrice * TAX_RATE);

      if (vehicleList.length > 0) {
        globalOrders.push({
          id: 'ORD_' + Math.floor(Math.random() * 10000),
          customerName, customerPhone: currentUser.phone,
          address: fullAddress, schedule: `${selectedDate.replace('\n', ' ')} lúc ${selectedTime}`,
          vehicles: vehicleList, grossPrice, finalPrice,
          status: 'pending', staffPhone: null, staffName: null, staffPlate: null, eta: 'Chưa xác định'
        });
        setCountdown(300); setForceRender(prev => prev + 1); setStep('tracking_order');
      } else {
        Alert.alert('Lỗi', 'Tất cả các xe đều bị hủy.'); setStep('booking_form');
      }
    }
  };

  const pendingOrders = globalOrders.filter(o => o.status === 'pending');
  const completedOrders = globalOrders.filter(o => o.status === 'completed' && (o.customerPhone === currentUser?.phone || o.staffPhone === currentUser?.phone));

  const handleStaffAcceptOrder = (orderId: string) => {
    const orderIndex = globalOrders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
      globalOrders[orderIndex].status = 'preparing';
      globalOrders[orderIndex].staffPhone = currentUser.phone;
      globalOrders[orderIndex].staffName = currentUser.name;
      globalOrders[orderIndex].staffPlate = currentUser.plate;
      setForceRender(prev => prev + 1);
    }
  };

  const handleStaffUpdateStatus = (newStatus: string, eta: string = '') => {
    if (myActiveStaffOrder) {
      myActiveStaffOrder.status = newStatus;
      if (eta) myActiveStaffOrder.eta = eta;
      setForceRender(prev => prev + 1);
    }
  };

  const handleStaffComplete = () => {
    if (proofImages.length < 2) { Alert.alert('Lỗi', 'Bắt buộc tải lên 2 ảnh minh chứng!'); return; }
    if (myActiveStaffOrder) {
      myActiveStaffOrder.status = 'completed'; setProofImages([]); setForceRender(prev => prev + 1);
      Alert.alert('Hoàn tất', 'Đã lưu doanh thu và xuất hóa đơn VAT.');
    }
  };

  const renderDropdownModal = (visible: boolean, setVisible: any, data: string[], onSelect: any, title: string) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={{maxHeight: 300}}>
            {data.map((item: string) => (
              <TouchableOpacity key={item} style={styles.modalItem} onPress={() => { onSelect(item); setVisible(false); }}>
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const handleCancelOrder = () => {
    if (myActiveCustomerOrder) {
      myActiveCustomerOrder.status = 'cancelled';
      setForceRender(p=>p+1);
      setStep('booking_form');
      Alert.alert('Đã hủy', 'Đơn hàng của bạn đã được hủy.');
    }
  }

  const isCus = currentUser?.role === 'customer';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, isCus && styles.cusContainerBg]}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* ================= 1. XÁC THỰC ================= */}
        {!currentUser && (
          <View style={styles.authBox}>
            <View style={{alignItems: 'center', marginBottom: 20}}>
              <Image 
                source={{uri: 'https://cdn-icons-png.flaticon.com/512/1973/1973940.png'}} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
              <Text style={styles.mainLogo}>Thay Nhớt Tại Nhà</Text>
            </View>
            
            <View style={styles.roleTab}>
              <TouchableOpacity style={[styles.roleBtn, role === 'customer' && styles.activeRole]} onPress={() => setRole('customer')}>
                <Text style={[styles.roleText, role === 'customer' && styles.activeText]}>Khách Hàng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleBtn, role === 'staff' && styles.activeRole]} onPress={() => setRole('staff')}>
                <Text style={[styles.roleText, role === 'staff' && styles.activeText]}>Nhân Viên Thợ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modeToggle}>
              <TouchableOpacity onPress={() => setAuthMode('login')} style={[styles.modeBtn, authMode === 'login' && styles.activeMode]}>
                <Text style={styles.modeText}>Đăng Nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAuthMode('register')} style={[styles.modeBtn, authMode === 'register' && styles.activeMode]}>
                <Text style={styles.modeText}>Đăng Ký</Text>
              </TouchableOpacity>
            </View>

            {authMode === 'register' && (
              <TextInput style={styles.input} placeholder="Họ và tên đầy đủ" placeholderTextColor="#888" value={nameInput} onChangeText={setNameInput} />
            )}
            <TextInput style={styles.input} placeholder="Số điện thoại (10 số)" placeholderTextColor="#888" keyboardType="numeric" maxLength={10} value={phoneInput} onChangeText={setPhoneInput} />
            <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor="#888" secureTextEntry value={passwordInput} onChangeText={setPasswordInput} />

            {authMode === 'register' && role === 'staff' && (
              <>
                <TextInput style={styles.input} placeholder="Số CCCD" placeholderTextColor="#888" keyboardType="numeric" value={cccdInput} onChangeText={setCccdInput} />
                <TextInput style={styles.input} placeholder="Biển số xe" placeholderTextColor="#888" value={plateInput} onChangeText={setPlateInput} />
              </>
            )}

            <TouchableOpacity style={styles.mainBtn} onPress={handleAuthSubmit}>
              <Text style={styles.mainBtnText}>{authMode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= 2. DASHBOARD KHÁCH HÀNG ================= */}
        {currentUser && currentUser.role === 'customer' && (
          <View style={styles.dashboard}>
            <View style={styles.cusHeader}>
              <Text style={styles.cusWelcomeText}>Xin chào, {currentUser.name} {'👋'}</Text>
              <TouchableOpacity onPress={() => setCurrentUser(null)}>
                <Text style={styles.cusLogoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>

            {currentTab === 'history' && (
              <View>
                <Text style={styles.cusSectionHeading}>{'📦 Lịch sử đơn hàng hoàn tất'}</Text>
                
                {/* Tách riêng điều kiện hiển thị để tránh lỗi TS */}
                {completedOrders.length === 0 && (
                  <Text style={styles.cusSubText}>Chưa có lịch sử.</Text>
                )}
                
                {completedOrders.length > 0 && completedOrders.map((ord: any) => (
                  <View key={ord.id} style={styles.cusHistoryCard}>
                    <Text style={styles.cusHistoryId}>Mã đơn: {ord.id}</Text>
                    <Text style={styles.cusHistoryText}>Ngày: {ord.schedule}</Text>
                    <Text style={styles.cusHistoryText}>Thợ phụ trách: {ord.staffName}</Text>
                    <Text style={styles.cusHistoryPrice}>Thanh toán: {ord.finalPrice.toLocaleString()}đ</Text>
                  </View>
                ))}
              </View>
            )}

            {currentTab === 'home' && (
              <View>
                {myActiveCustomerOrder ? (
                  <View style={styles.radarScreen}>
                    {myActiveCustomerOrder.status === 'pending' ? (
                      <View style={styles.radarContainer}>
                        <View style={styles.radarOuter}>
                           <View style={styles.radarMiddle}>
                               <View style={styles.radarInner}>
                                   <Text style={{fontSize: 30}}>{'📍'}</Text>
                               </View>
                           </View>
                        </View>
                        <View style={styles.radarBottomCard}>
                          <Text style={styles.radarTitle}>Đang quét tìm thợ quanh bạn...</Text>
                          <Text style={styles.radarTimer}>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</Text>
                          <TouchableOpacity style={styles.cancelRadarBtn} onPress={handleCancelOrder}>
                            <Text style={styles.cancelRadarText}>Hủy tìm kiếm</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.cusCard}>
                        <Text style={styles.trackingTitle}>Trạng thái: {myActiveCustomerOrder.id}</Text>
                        {myActiveCustomerOrder.status === 'preparing' && <Text style={styles.cusTimerText}>{'👷 Thợ đang chuẩn bị đồ nghề'}</Text>}
                        {myActiveCustomerOrder.status === 'moving' && <Text style={styles.cusTimerText}>{'🛵 Thợ đang di chuyển ('}{myActiveCustomerOrder.eta}{')'}</Text>}
                        {myActiveCustomerOrder.status === 'arrived' && <Text style={styles.cusTimerText}>{'📍 Thợ đã đến nơi. Vui lòng ra đón!'}</Text>}
                        
                        <View style={styles.cusDriverCard}>
                          <Text style={styles.cusDriverText}>{'👨‍🔧 Thợ: '} {myActiveCustomerOrder.staffName}</Text>
                          <Text style={styles.cusDriverText}>{'🏍️ Biển số: '} {myActiveCustomerOrder.staffPlate}</Text>
                          <View style={styles.row}>
                            <TouchableOpacity style={styles.cusCallBtn} onPress={() => Alert.alert('Gọi', 'Đang gọi...')}><Text style={styles.cusBtnTextW}>{'📞 Gọi'}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.cusChatBtn} onPress={() => Alert.alert('Chat', 'Mở chat')}><Text style={styles.cusBtnTextW}>{'💬 Chat'}</Text></TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    {step === 'booking_form' && (
                      <View style={styles.cusCard}>
                        <View style={styles.bannerMock}><Text style={styles.bannerText}>{'🌟 THAY NHỚT TẬN NHÀ - GIẢM 10% PHÍ CÔNG'}</Text></View>

                        <Text style={styles.cusSectionHeading}>{'📍 Địa chỉ thực hiện'}</Text>
                        <View style={styles.row}>
                          <TouchableOpacity style={styles.cusDropdownBtn} onPress={() => setShowDistrictModal(true)}>
                            <Text style={styles.cusDropdownText}>{selectedDistrict || 'Chọn Quận/Huyện'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.cusDropdownBtn} onPress={() => {
                            if(!selectedDistrict) Alert.alert('Lỗi', 'Chọn Quận trước!'); else setShowWardModal(true);
                          }}>
                            <Text style={styles.cusDropdownText}>{selectedWard || 'Chọn Phường/Xã'}</Text>
                          </TouchableOpacity>
                        </View>
                        {renderDropdownModal(showDistrictModal, setShowDistrictModal, Object.keys(HCM_DATA), (val: string) => { setSelectedDistrict(val); setSelectedWard(''); }, "Chọn Quận/Huyện")}
                        {renderDropdownModal(showWardModal, setShowWardModal, selectedDistrict ? HCM_DATA[selectedDistrict] : [], setSelectedWard, "Chọn Phường/Xã")}

                        <TextInput style={styles.cusInput} placeholder="Số nhà, tên đường..." placeholderTextColor="#A0AEC0" value={streetAddress} onChangeText={setStreetAddress} />
                        
                        {streetAddress.length > 0 && selectedWard.length > 0 && selectedDistrict.length > 0 && (
                          <Text style={styles.realtimeAddressText}>
                            {'📍 Điểm đến:'} {streetAddress}, {selectedWard}, {selectedDistrict}, TP.HCM
                          </Text>
                        )}

                        <Text style={styles.cusSectionHeading}>{'📅 Chọn ngày giao'}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                          {DATES.map((d: string) => (
                            <TouchableOpacity key={d} style={[styles.cusScrollDateBtn, selectedDate === d && styles.cusActiveBgOrange]} onPress={() => setSelectedDate(d)}>
                              <Text style={[styles.cusScrollDateText, selectedDate === d && styles.cusActiveTextW]}>{d}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        <Text style={styles.cusSectionHeading}>{'⏰ Chọn khung giờ (Đã khóa +1h05m)'}</Text>
                        <View style={styles.gridWrap}>
                          {availableTimes.map((t: string) => (
                            <TouchableOpacity key={t} style={[styles.cusGridTimeBtn, selectedTime === t && styles.cusActiveBgOrange]} onPress={() => setSelectedTime(t)}>
                              <Text style={[styles.cusGridTimeText, selectedTime === t && styles.cusActiveTextW]}>{t}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <Text style={styles.cusSectionHeading}>{'🏍️ Số lượng xe'}</Text>
                        <View style={styles.row}>
                          {[1, 2, 3].map((n: number) => (
                            <TouchableOpacity key={n} style={[styles.cusNumBtn, totalVehicles === n && styles.cusActiveBgNavy]} onPress={() => setTotalVehicles(n)}>
                              <Text style={[styles.cusNumText, totalVehicles === n && styles.cusActiveTextW]}>{n} Xe</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <TouchableOpacity style={styles.cusMainBtn} onPress={handleProceedToVehicleConfig}>
                          <Text style={styles.cusMainBtnText}>CHỌN NHỚT CHO {totalVehicles} XE</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {step === 'vehicle_details' && (
                      <View style={styles.cusCard}>
                        <Text style={styles.cusStepIndicator}>Cấu hình Xe số {currentConfigIndex + 1} / {totalVehicles}</Text>
                        <TextInput style={styles.cusInput} value={tempBrand} onChangeText={setTempBrand} placeholder="Nhập Hãng/Dòng xe..." placeholderTextColor="#A0AEC0" />

                        <Text style={styles.cusLabel}>Nhớt Máy (Product Thumbnails):</Text>
                        {ENGINE_OILS.map((oil: any) => (
                          <TouchableOpacity key={oil.id} style={[styles.cusOilOption, tempEngineOil?.id === oil.id && styles.cusSelectedOil]} onPress={() => setTempEngineOil(tempEngineOil?.id === oil.id ? null : oil)}>
                            <Text style={styles.cusOilName}>{'🛢️ '} {oil.name}</Text>
                            <Text style={styles.cusOilPrice}>{oil.price.toLocaleString()}đ</Text>
                          </TouchableOpacity>
                        ))}

                        <Text style={styles.cusLabel}>Nhớt Láp/Hộp Số (Tùy chọn):</Text>
                        {GEAR_OILS.map((oil: any) => (
                          <TouchableOpacity key={oil.id} style={[styles.cusOilOption, tempGearOil?.id === oil.id && styles.cusSelectedOil]} onPress={() => setTempGearOil(tempGearOil?.id === oil.id ? null : oil)}>
                            <Text style={styles.cusOilName}>{'⚙️ '} {oil.name}</Text>
                            <Text style={styles.cusOilPrice}>{oil.price.toLocaleString()}đ</Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={styles.cusMainBtn} onPress={handleSaveCurrentVehicle}>
                          <Text style={styles.cusMainBtnText}>{currentConfigIndex + 1 < totalVehicles ? 'LƯU & SANG XE TIẾP' : 'ĐẶT LỊCH NGAY'}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ================= 3. DASHBOARD NHÂN VIÊN THỢ ================= */}
        {currentUser && currentUser.role === 'staff' && (
          <View style={styles.dashboard}>
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Thợ: {currentUser.name}</Text>
              <TouchableOpacity onPress={() => setCurrentUser(null)}><Text style={styles.logoutText}>Đăng xuất</Text></TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Trạng thái (Online/Offline):</Text>
                <TouchableOpacity style={[styles.shiftBtn, isWorking ? styles.endShift : styles.activeBgStaff]} onPress={() => setIsWorking(!isWorking)}>
                  <Text style={styles.btnText}>{isWorking ? 'KẾT THÚC CA' : 'BẬT ONLINE NHẬN ĐƠN'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.earningsBanner}>Tổng thu nhập: {completedOrders.reduce((acc:any, o:any)=> acc + (o.grossPrice * (1-APP_FEE_PERCENT)), 0).toLocaleString()}đ</Text>
            </View>

            <View style={styles.tabNav}>
              <TouchableOpacity style={[styles.navItem, currentTab === 'home' && styles.navItemActiveStaff]} onPress={() => setCurrentTab('home')}>
                <Text style={styles.navText}>Đơn Hiện Tại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.navItem, currentTab === 'history' && styles.navItemActiveStaff]} onPress={() => setCurrentTab('history')}>
                <Text style={styles.navText}>Đã Hoàn Thành</Text>
              </TouchableOpacity>
            </View>

            {currentTab === 'history' && (
               <View>
                 {completedOrders.length === 0 && (
                   <Text style={styles.subText}>Chưa có lịch sử.</Text>
                 )}
                 {completedOrders.length > 0 && completedOrders.map((ord: any) => (
                   <View key={ord.id} style={styles.jobCard}>
                     <Text style={styles.jobTitle}>{ord.id} - Khách: {ord.customerName}</Text>
                     <Text style={styles.jobPrice}>Đã nhận: {(ord.grossPrice * (1-APP_FEE_PERCENT)).toLocaleString()}đ</Text>
                   </View>
                 ))}
               </View>
            )}

            {currentTab === 'home' && isWorking && (
              <View>
                {!myActiveStaffOrder ? (
                  <View>
                    <Text style={styles.sectionHeading}>{'🚨 Yêu Cầu Mới (Incoming Job Pop-up):'}</Text>
                    
                    {pendingOrders.length === 0 && (
                      <Text style={styles.subText}>Không có đơn mới.</Text>
                    )}
                    
                    {pendingOrders.length > 0 && pendingOrders.map((ord: any) => (
                      <View key={ord.id} style={styles.incomingJobCard}>
                        <Text style={styles.incomingTitle}>{'ĐƠN YÊU CẦU MỚI!'}</Text>
                        <View style={styles.progressBarBg}><View style={styles.progressBarFill}/></View>
                        
                        <Text style={styles.jobDetail}>{'📍 Khách: '} {ord.customerName} {'(Dưới 10km)'}</Text>
                        <Text style={styles.jobDetail}>{'🏠 '} {ord.address}</Text>
                        <Text style={styles.jobDetail}>{'⏰ '} {ord.schedule}</Text>
                        <Text style={styles.jobDetail}>{'🛢️ '} {ord.vehicles.length} {' Xe Yêu cầu thay nhớt'}</Text>
                        <Text style={styles.incomingEarn}>{'💰 Bạn sẽ nhận: '} {(ord.grossPrice * (1-APP_FEE_PERCENT)).toLocaleString()}{'đ'}</Text>
                        
                        <View style={{marginTop: 15}}>
                          <TouchableOpacity style={styles.massiveAcceptBtn} onPress={() => handleStaffAcceptOrder(ord.id)}>
                            <Text style={styles.massiveBtnText}>CHẤP NHẬN ĐƠN NÀY (ACCEPT)</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.smallDeclineBtn}>
                            <Text style={styles.smallDeclineText}>Từ chối (Decline)</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.activeJobBox}>
                    <Text style={styles.sectionHeading}>{'🛠️ Đơn đang xử lý: '} {myActiveStaffOrder.id}</Text>
                    <Text style={styles.jobTitle}>{myActiveStaffOrder.customerName} - {myActiveStaffOrder.customerPhone}</Text>
                    <Text style={styles.jobDetail}>{'📍 '} {myActiveStaffOrder.address}</Text>
                    
                    <View style={styles.vehicleListBox}>
                      <Text style={{color: '#fff', fontWeight: 'bold', marginBottom: 5}}>Vật tư cần chuẩn bị:</Text>
                      {myActiveStaffOrder.vehicles.map((v: any, i: number) => (
                        <Text key={i} style={styles.jobDetail}>- Xe {v.brand}: {v.engineOil?.name || 'Không'} | {v.gearOil?.name || 'Không'}</Text>
                      ))}
                    </View>

                    {myActiveStaffOrder.status === 'preparing' && (
                      <TouchableOpacity style={styles.mainBtn} onPress={() => handleStaffUpdateStatus('moving', 'Dự kiến 15 phút')}>
                        <Text style={styles.mainBtnText}>{'🚗 BẮT ĐẦU DI CHUYỂN ĐẾN'}</Text>
                      </TouchableOpacity>
                    )}
                    {myActiveStaffOrder.status === 'moving' && (
                      <TouchableOpacity style={styles.mainBtn} onPress={() => handleStaffUpdateStatus('arrived')}>
                        <Text style={styles.mainBtnText}>{'📍 ĐÃ ĐẾN NƠI'}</Text>
                      </TouchableOpacity>
                    )}
                    {myActiveStaffOrder.status === 'arrived' && (
                      <View>
                        <Text style={styles.label}>Chụp 2 ảnh minh chứng công việc:</Text>
                        <View style={styles.row}>
                          <TouchableOpacity style={styles.cameraBtn} onPress={() => setProofImages(p => [...p, 'IMG1'])}>
                            <Text style={styles.btnText}>{'📷 Nhớt cũ '} {proofImages.includes('IMG1') ? '✅' : ''}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.cameraBtn} onPress={() => setProofImages(p => [...p, 'IMG2'])}>
                            <Text style={styles.btnText}>{'📷 Châm mới '} {proofImages.includes('IMG2') ? '✅' : ''}</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.massiveAcceptBtn, proofImages.length < 2 && {backgroundColor: '#475569'}]} onPress={handleStaffComplete}>
                          <Text style={styles.massiveBtnText}>HOÀN THÀNH & XUẤT HÓA ĐƠN VAT</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* BOTTOM NAVIGATION CHO KHÁCH HÀNG */}
        {currentUser && currentUser.role === 'customer' && (
          <View style={styles.cusBottomNav}>
            <TouchableOpacity style={styles.cusBottomBtn} onPress={() => setCurrentTab('home')}>
              <Text style={[styles.cusBottomText, currentTab === 'home' && styles.cusBottomTextActive]}>{'🏠 Trang chủ'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cusBottomBtn} onPress={() => setCurrentTab('history')}>
              <Text style={[styles.cusBottomText, currentTab === 'history' && styles.cusBottomTextActive]}>{'🧾 Lịch sử'}</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  cusContainerBg: { backgroundColor: '#F3F4F6' },
  contentContainer: { padding: 15, paddingBottom: 80 },
  authBox: { flex: 1, justifyContent: 'center', marginTop: 40 },
  logoImage: { width: 100, height: 100, borderRadius: 20, marginBottom: 10 },
  mainLogo: { fontSize: 26, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center', marginBottom: 20 },
  roleTab: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 8, marginBottom: 15, padding: 4 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeRole: { backgroundColor: '#3b82f6' },
  roleText: { color: '#64748b', fontWeight: 'bold' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  modeToggle: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#334155', borderRadius: 6, padding: 3 },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 4 },
  activeMode: { backgroundColor: '#0f172a' },
  modeText: { color: '#cbd5e1', fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: '#1e293b', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  lockedInput: { backgroundColor: '#0f172a', color: '#94a3b8', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  mainBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  mainBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  dashboard: { flex: 1, marginTop: 5 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  cusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingTop: 10 },
  cusWelcomeText: { color: '#1E3A8A', fontSize: 18, fontWeight: 'bold' },
  cusLogoutText: { color: '#EF4444', fontWeight: 'bold' },
  cusCard: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cusSectionHeading: { color: '#1E3A8A', fontSize: 15, fontWeight: 'bold', marginTop: 5, marginBottom: 10 },
  cusLabel: { color: '#4A5568', fontSize: 13, marginBottom: 8, marginTop: 4, fontWeight: '600' },
  cusInput: { backgroundColor: '#F7FAFC', color: '#2D3748', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  realtimeAddressText: { color: '#F97316', fontSize: 13, fontWeight: '600', fontStyle: 'italic', marginBottom: 15 },
  cusDropdownBtn: { flex: 1, backgroundColor: '#F7FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E0', alignItems: 'center' },
  cusDropdownText: { color: '#1E3A8A', fontSize: 13, fontWeight: 'bold' },
  cusScrollDateBtn: { backgroundColor: '#EDF2F7', padding: 12, borderRadius: 12, marginRight: 10, minWidth: 80, alignItems: 'center' },
  cusScrollDateText: { color: '#4A5568', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  cusGridTimeBtn: { backgroundColor: '#EDF2F7', padding: 12, borderRadius: 10, width: '48%', alignItems: 'center' },
  cusGridTimeText: { color: '#4A5568', fontSize: 13, fontWeight: '600' },
  cusActiveBgOrange: { backgroundColor: '#F97316' },
  cusActiveBgNavy: { backgroundColor: '#1E3A8A' },
  cusActiveTextW: { color: '#FFFFFF' },
  cusNumBtn: { flex: 1, backgroundColor: '#EDF2F7', padding: 12, alignItems: 'center', borderRadius: 10 },
  cusNumText: { color: '#4A5568', fontWeight: 'bold' },
  cusMainBtn: { backgroundColor: '#F97316', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15, shadowColor: '#F97316', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 5 },
  cusMainBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  cusOilOption: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between' },
  cusSelectedOil: { borderColor: '#F97316', borderWidth: 2, backgroundColor: '#FFF5F0' },
  cusOilName: { color: '#1E3A8A', fontSize: 14, flex: 1, fontWeight: '600' },
  cusOilPrice: { color: '#F97316', fontWeight: 'bold' },
  cusStepIndicator: { color: '#F97316', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  bannerMock: { backgroundColor: '#FFF5F0', padding: 10, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#F97316' },
  bannerText: { color: '#DD6B20', fontWeight: 'bold', fontSize: 12 },
  
  cusBottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 15, borderTopWidth: 1, borderColor: '#E2E8F0', justifyContent: 'space-around' },
  cusBottomBtn: { alignItems: 'center' },
  cusBottomText: { color: '#A0AEC0', fontWeight: '600', fontSize: 12 },
  cusBottomTextActive: { color: '#1E3A8A', fontWeight: 'bold' },
  
  cusSubText: { color: '#718096', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  cusHistoryCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#F97316', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  cusHistoryId: { color: '#A0AEC0', fontSize: 12, marginBottom: 4 },
  cusHistoryText: { color: '#2D3748', fontSize: 13, marginBottom: 4, fontWeight: '500' },
  cusHistoryPrice: { color: '#1E3A8A', fontWeight: 'bold', fontSize: 15 },
  cusTimerText: { color: '#F97316', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  cusDriverCard: { backgroundColor: '#EDF2F7', padding: 15, borderRadius: 12, marginVertical: 15 },
  cusDriverText: { color: '#1E3A8A', marginBottom: 6, fontSize: 14, fontWeight: '600' },
  cusCallBtn: { flex: 1, backgroundColor: '#1E3A8A', padding: 12, alignItems: 'center', borderRadius: 10 },
  cusChatBtn: { flex: 1, backgroundColor: '#4A5568', padding: 12, alignItems: 'center', borderRadius: 10 },
  cusBtnTextW: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },

  radarScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  radarContainer: { alignItems: 'center', width: '100%' },
  radarOuter: { width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  radarMiddle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(59, 130, 246, 0.2)', justifyContent: 'center', alignItems: 'center' },
  radarInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59, 130, 246, 0.4)', justifyContent: 'center', alignItems: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.8, shadowRadius: 20 },
  radarBottomCard: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 20, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 },
  radarTitle: { color: '#1E3A8A', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  radarTimer: { color: '#F97316', fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
  cancelRadarBtn: { backgroundColor: '#FEE2E2', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  cancelRadarText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  welcomeText: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold' },
  logoutText: { color: '#ef4444', fontWeight: 'bold' },
  tabNav: { flexDirection: 'row', marginBottom: 15, borderBottomWidth: 1, borderColor: '#334155' },
  navItem: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  navItemActiveStaff: { borderBottomWidth: 2, borderColor: '#10b981' },
  navText: { color: '#cbd5e1', fontWeight: 'bold' },
  card: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 15 },
  sectionHeading: { color: '#38bdf8', fontSize: 15, fontWeight: 'bold', marginTop: 5, marginBottom: 10 },
  label: { color: '#cbd5e1', fontSize: 13, marginBottom: 8, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  endShift: { backgroundColor: '#ef4444' },
  activeBgStaff: { backgroundColor: '#10b981' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  earningsBanner: { color: '#f59e0b', fontWeight: 'bold', fontSize: 15, marginTop: 15 },
  
  incomingJobCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  incomingTitle: { color: '#FCD34D', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  progressBarBg: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 15 },
  progressBarFill: { height: 6, backgroundColor: '#10B981', borderRadius: 3, width: '70%' },
  jobTitle: { color: '#38bdf8', fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  jobDetail: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, fontWeight: '500' },
  incomingEarn: { color: '#10B981', fontWeight: 'bold', fontSize: 20, marginTop: 10, textAlign: 'center' },
  massiveAcceptBtn: { backgroundColor: '#10B981', padding: 18, borderRadius: 12, alignItems: 'center' },
  massiveBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  smallDeclineBtn: { backgroundColor: 'transparent', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  smallDeclineText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
  
  jobCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#38bdf8' },
  jobPrice: { color: '#10b981', fontWeight: 'bold', fontSize: 16, marginTop: 5 },
  activeJobBox: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginTop: 10, borderWidth: 2, borderColor: '#10b981' },
  vehicleListBox: { backgroundColor: '#0f172a', padding: 12, borderRadius: 8, marginVertical: 10 },
  cameraBtn: { flex: 1, backgroundColor: '#475569', padding: 14, alignItems: 'center', borderRadius: 8 },
  completeJobBtn: { backgroundColor: '#10b981', padding: 16, alignItems: 'center', borderRadius: 10, marginTop: 15 },
  subText: { color: '#64748b', fontStyle: 'italic', textAlign: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 16, padding: 20 },
  modalTitle: { color: '#1E3A8A', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalItemText: { color: '#4A5568', fontSize: 15, textAlign: 'center', fontWeight: '600' },
  vatCard: { backgroundColor: '#f8fafc', width: '100%', borderRadius: 12, padding: 20 },
  totalSum: { color: '#ef4444', fontWeight: 'bold', fontSize: 18, textAlign: 'right' },
  trackingTitle: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
});