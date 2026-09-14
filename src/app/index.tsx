import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// --- CẤU HÌNH THÔNG BÁO ĐẨY ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// --- KẾT NỐI FIREBASE AN TOÀN ---
import { getApps, initializeApp } from 'firebase/app';
import { get, getDatabase, onValue, push, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAsxfqndwvJfIiJ2XlLZarWJTr7EhruITM",
  authDomain: "thaynhottainha-c36fe.firebaseapp.com",
  databaseURL: "https://thaynhottainha-c36fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thaynhottainha-c36fe",
  storageBucket: "thaynhottainha-c36fe.firebasestorage.app",
  messagingSenderId: "253374186584",
  appId: "1:253374186584:web:7d1ec1eef733825a5cf62d",
  measurementId: "G-BWYLHEGfZP"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

// --- FULL DỮ LIỆU ĐỊA CHỈ TP.HCM ---
const HCM_DATA: Record<string, string[]> = {
  "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cô Giang", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Đa Kao", "Phường Nguyễn Cư Trinh", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Tân Định"],
  "Quận 3": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường Võ Thị Sáu"],
  "Quận 4": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6", "Phường 8", "Phường 9", "Phường 10", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 18"],
  "Quận 5": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
  "Quận 6": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
  "Quận 7": ["Phường Bình Thuận", "Phường Phú Mỹ", "Phường Phú Thuận", "Phường Tân Hưng", "Phường Tân Kiểng", "Phường Tân Phong", "Phường Tân Phú", "Phường Tân Quy", "Phường Tân Thuận Đông", "Phường Tân Thuận Tây"],
  "Quận 8": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
  "Quận 10": ["Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
  "Quận 11": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
  "Quận 12": ["Phường An Phú Đông", "Phường Đông Hưng Thuận", "Phường Hiệp Thành", "Phường Tân Chánh Hiệp", "Phường Tân Hưng Thuận", "Phường Tân Thới Hiệp", "Phường Tân Thới Nhất", "Phường Thạnh Lộc", "Phường Thạnh Xuân", "Phường Thới An", "Phường Trung Mỹ Tây"],
  "Bình Tân": ["Phường An Lạc", "Phường An Lạc A", "Phường Bình Hưng Hòa", "Phường Bình Hưng Hòa A", "Phường Bình Hưng Hòa B", "Phường Bình Trị Đông", "Phường Bình Trị Đông A", "Phường Bình Trị Đông B", "Phường Tân Tạo", "Phường Tân Tạo A"],
  "Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"],
  "Gò Vấp": ["Phường 1", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17"],
  "Phú Nhuận": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 13", "Phường 15", "Phường 17"],
  "Tân Bình": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
  "Tân Phú": ["Phường Hiệp Tân", "Phường Hòa Thạnh", "Phường Phú Thạnh", "Phường Phú Thọ Hòa", "Phường Phú Trung", "Phường Sơn Kỳ", "Phường Tân Quý", "Phường Tân Sơn Nhì", "Phường Tân Thành"],
  "TP. Thủ Đức": ["Phường An Khánh", "Phường An Lợi Đông", "Phường An Phú", "Phường Bình Chiểu", "Phường Bình Thọ", "Phường Bình Trưng Đông", "Phường Bình Trưng Tây", "Phường Cát Lái", "Phường Hiệp Bình Chánh", "Phường Hiệp Bình Phước", "Phường Hiệp Phú", "Phường Linh Chiểu", "Phường Linh Đông", "Phường Linh Tây", "Phường Linh Trung", "Phường Linh Xuân", "Phường Long Bình", "Phường Long Phước", "Phường Long Thạnh Mỹ", "Phường Long Trường", "Phường Phú Hữu", "Phường Phước Bình", "Phường Phước Long A", "Phường Phước Long B", "Phường Tam Bình", "Phường Tam Phú", "Phường Tân Phú", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Thạnh Mỹ Lợi", "Phường Thảo Điền", "Phường Thủ Thiêm", "Phường Trường Thạnh"],
  "Huyện Bình Chánh": ["Thị trấn Tân Túc", "Xã An Phú Tây", "Xã Bình Chánh", "Xã Bình Hưng", "Xã Bình Lợi", "Xã Đa Phước", "Xã Hưng Long", "Xã Lê Minh Xuân", "Xã Phạm Văn Hai", "Xã Phong Phú", "Xã Quy Đức", "Xã Tân Kiên", "Xã Tân Nhựt", "Xã Tân Quý Tây", "Xã Vĩnh Lộc A", "Xã Vĩnh Lộc B"],
  "Huyện Cần Giờ": ["Thị trấn Cần Thạnh", "Xã An Thới Đông", "Xã Bình Khánh", "Xã Hòa Hiệp", "Xã Long Hòa", "Xã Lý Nhơn", "Xã Tam Thôn Hiệp"],
  "Huyện Củ Chi": ["Thị trấn Củ Chi", "Xã An Nhơn Tây", "Xã An Phú", "Xã Bình Mỹ", "Xã Hòa Phú", "Xã Nhuận Đức", "Xã Phạm Văn Cội", "Xã Phú Hòa Đông", "Xã Phú Mỹ Hưng", "Xã Phước Hiệp", "Xã Phước Thạnh", "Xã Phước Vĩnh An", "Xã Tân An Hội", "Xã Tân Phú Trung", "Xã Tân Thạnh Đông", "Xã Tân Thạnh Tây", "Xã Tân Thông Hội", "Xã Thái Mỹ", "Xã Trung An", "Xã Trung Lập Hạ", "Xã Trung Lập Thượng"],
  "Huyện Hóc Môn": ["Thị trấn Hóc Môn", "Xã Bà Điểm", "Xã Đông Thạnh", "Xã Nhị Bình", "Xã Tân Hiệp", "Xã Tân Thới Nhì", "Xã Tân Xuân", "Xã Thới Tam Thôn", "Xã Trung Chánh", "Xã Xuân Thới Đông", "Xã Xuân Thới Sơn", "Xã Xuân Thới Thượng"],
  "Huyện Nhà Bè": ["Thị trấn Nhà Bè", "Xã Hiệp Phước", "Xã Long Thới", "Xã Nhơn Đức", "Xã Phú Xuân", "Xã Phước Kiển", "Xã Phước Lộc"]
};

const getDynamicDates = () => {
  const dates = [];
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    if (i === 0) dates.push(`Hôm nay\n${dayStr}`);
    else if (i === 1) dates.push(`Ngày mai\n${dayStr}`);
    else dates.push(`${daysOfWeek[d.getDay()]}\n${dayStr}`);
  }
  return dates;
};

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

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'staff' | 'admin'>('customer');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [cccdInput, setCccdInput] = useState('');
  const [plateInput, setPlateInput] = useState('');

  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'profile'>('home');
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  
  const [bookingStep, setBookingStep] = useState<'booking_form' | 'full_map' | 'vehicle_details' | 'checkout'>('booking_form');
  
  const [streetAddress, setStreetAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  const [currentLocation, setCurrentLocation] = useState({ latitude: 10.8038, longitude: 106.7126 });
  const [selectedCoord, setSelectedCoord] = useState({ latitude: 10.8038, longitude: 106.7126 });

  const [selectedDate, setSelectedDate] = useState(getDynamicDates()[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  const [totalVehicles, setTotalVehicles] = useState(1);
  const [customVehicleCount, setCustomVehicleCount] = useState('');
  const [vehicleList, setVehicleList] = useState<any[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [tempBrand, setTempBrand] = useState('Honda AirBlade');
  const [tempEngineOil, setTempEngineOil] = useState<any>(null);
  const [tempGearOil, setTempGearOil] = useState<any>(null);

  // VOUCHER MẢNG DYNAMIC TỪ FIREBASE
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [customPromoCode, setCustomPromoCode] = useState('');
  
  // STATE TẠO VOUCHER MỚI CHO ADMIN
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState('');
  const [newVoucherCount, setNewVoucherCount] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [showQRPopup, setShowQRPopup] = useState(false);

  const [isWorking, setIsWorking] = useState(false);
  const [countdown, setCountdown] = useState(300);

  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRatingOrder, setSelectedRatingOrder] = useState<any>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const [staffInvoiceOrder, setStaffInvoiceOrder] = useState<any>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [remoteOrders, setRemoteOrders] = useState<any[]>([]);

  // ĐĂNG KÝ QUYỀN THÔNG BÁO ĐẨY
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Quyền thông báo chưa được cấp!');
      }
    })();
  }, []);

  // LẤY GPS
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setCurrentLocation(coords);
      setSelectedCoord(coords);
    })();
  }, []);

  // LẮNG NGHE ĐƠN HÀNG & VOUCHERS TỪ FIREBASE
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      setRemoteOrders(data ? Object.values(data) : []);
    });

    const vouchersRef = ref(db, 'vouchers');
    onValue(vouchersRef, (snapshot) => {
      const data = snapshot.val();
      setVouchers(data ? Object.values(data) : []);
    });
  }, []);

  const myActiveCustomerOrder = remoteOrders.find(o => o.customerPhone === currentUser?.phone && o.status !== 'completed' && o.status !== 'cancelled');
  const myActiveStaffOrder = remoteOrders.find(o => o.staffPhone === currentUser?.phone && o.status !== 'completed' && o.status !== 'cancelled');

  // GỬI THÔNG BÁO ĐẨY CHO THỢ
  useEffect(() => {
    const pendingCount = remoteOrders.filter(o => o.status === 'pending').length;
    if (pendingCount > 0 && currentUser?.role === 'staff') {
      Notifications.scheduleNotificationAsync({
        content: { title: "🚨 Có đơn thay nhớt mới!", body: `Có khách hàng đang đặt lịch. Vào nhận đơn ngay!`, sound: true },
        trigger: null,
      });
    }
  }, [remoteOrders.length]);

  // GPS ĐỒNG BỘ CHO THỢ KHI ĐANG DI CHUYỂN
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    if (currentUser?.role === 'staff' && myActiveStaffOrder?.status === 'moving') {
      (async () => {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
          (loc) => {
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setCurrentLocation(coords);
            set(ref(db, `orders/${myActiveStaffOrder.id}/staffCoord`), coords);
          }
        );
      })();
    }
    return () => { if (subscription) subscription.remove(); };
  }, [currentUser, myActiveStaffOrder?.status]);

  const handleMakeCall = (phoneNumber: string) => {
    if (!phoneNumber) { Alert.alert('Lỗi', 'Không tìm thấy số điện thoại!'); return; }
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (!supported) Alert.alert('Lỗi', 'Thiết bị không hỗ trợ gọi.');
      else return Linking.openURL(url);
    }).catch(() => Alert.alert('Lỗi', 'Không thể gọi điện.'));
  };

  useEffect(() => {
    if (showChatModal && (myActiveCustomerOrder?.id || myActiveStaffOrder?.id)) {
      const id = myActiveCustomerOrder?.id || myActiveStaffOrder?.id;
      const chatRef = ref(db, `orders/${id}/chats`);
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        setChatMessages(data ? Object.values(data) : []);
      });
      return () => unsubscribe();
    }
  }, [showChatModal, myActiveCustomerOrder, myActiveStaffOrder]);

  const handleSendMessage = () => {
    const id = myActiveCustomerOrder?.id || myActiveStaffOrder?.id;
    if (!newMessageText.trim() || !id) return;
    push(ref(db, `orders/${id}/chats`), {
      senderPhone: currentUser?.phone, senderName: currentUser?.name,
      text: newMessageText.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setNewMessageText('');
  };

  const validatePhone = (p: string) => /^[0-9]{10}$/.test(p);
  
  const handleAuthSubmit = async () => {
    // --- LỖ HỔNG (BACKDOOR) BÍ MẬT CHO ADMIN ---
    if (phoneInput === 'admin' && passwordInput === 'tinlaoao') {
      setCurrentUser({ phone: 'admin', name: 'Quản Trị Viên (Admin)', role: 'admin' });
      return;
    }

    if (!phoneInput) { Alert.alert('Lỗi', 'Số điện thoại không được để trống!'); return; }
    if (!validatePhone(phoneInput)) { Alert.alert('Lỗi', 'Số điện thoại phải đúng 10 chữ số!'); return; }
    if (!passwordInput) { Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu!'); return; }

    if (authMode === 'register') {
      if (!nameInput) { Alert.alert('Lỗi', 'Vui lòng nhập Họ Tên!'); return; }
      try {
        const snapshot = await get(ref(db, `users/${phoneInput}`));
        if (snapshot.exists()) { Alert.alert('Thông báo', 'Số điện thoại đã tồn tại!'); return; }
        await set(ref(db, 'users/' + phoneInput), { phone: phoneInput, password: passwordInput, role, name: nameInput, cccd: cccdInput, plate: plateInput });
        Alert.alert('Thành công', 'Đăng ký thành công!');
        setAuthMode('login');
      } catch (error: any) { Alert.alert('Lỗi', error.message); }
    } else {
      try {
        const snapshot = await get(ref(db, `users/${phoneInput}`));
        if (!snapshot.exists()) { Alert.alert('Lỗi', 'Tài khoản không tồn tại!'); return; }
        const user = snapshot.val();
        if (user.role !== role) { Alert.alert('Lỗi', 'Sai vai trò đăng nhập!'); return; }
        if (user.password !== passwordInput) { Alert.alert('Lỗi', 'Sai mật khẩu!'); return; }
        setCurrentUser(user);
        setEditName(user.name);
      } catch (error: any) { Alert.alert('Lỗi', error.message); }
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) { Alert.alert('Lỗi', 'Họ tên không được để trống!'); return; }
    try {
      const updatedUser = { ...currentUser, name: editName };
      if (editPassword.trim()) {
        if (editPassword.length < 6) { Alert.alert('Lỗi', 'Mật khẩu mới từ 6 ký tự!'); return; }
        updatedUser.password = editPassword;
      }
      await set(ref(db, `users/${currentUser?.phone}`), updatedUser);
      setCurrentUser(updatedUser);
      setEditPassword(''); // Xóa bộ nhớ đệm mật khẩu để tránh lỗi dính mk cũ
      Alert.alert('Thành công', 'Đã cập nhật thông tin thành công!');
    } catch (error: any) { Alert.alert('Lỗi', error.message); }
  };

  // ADMIN - TẠO VOUCHER MỚI
  const handleCreateVoucher = () => {
    if (!newVoucherCode || !newVoucherDiscount || !newVoucherCount) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin tạo Voucher!'); return;
    }
    const vId = 'VOUCHER_' + new Date().getTime();
    set(ref(db, `vouchers/${vId}`), {
      id: vId,
      code: newVoucherCode.toUpperCase(),
      title: `Giảm ${newVoucherDiscount}% (Mã: ${newVoucherCode.toUpperCase()})`,
      discountPercent: parseInt(newVoucherDiscount),
      remaining: parseInt(newVoucherCount),
      active: true
    });
    Alert.alert('Thành công', 'Đã tạo Voucher mới đưa lên hệ thống!');
    setNewVoucherCode(''); setNewVoucherDiscount(''); setNewVoucherCount('');
  };

  useEffect(() => {
    const isToday = selectedDate.includes('Hôm nay');
    const slots: string[] = [];
    let startHour = isToday ? new Date().getHours() + 1 : 8;
    if (startHour < 8) startHour = 8;
    for(let i = startHour; i < 17; i++) slots.push(`${i}:00 - ${i+1}:00`);
    setAvailableTimes(slots); 
    setSelectedTime(slots.length > 0 ? slots[0] : 'Hết giờ hôm nay');
  }, [selectedDate]);

  useEffect(() => {
    let timer: any;
    if (myActiveCustomerOrder?.status === 'pending' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && myActiveCustomerOrder?.status === 'pending') {
      set(ref(db, 'orders/' + myActiveCustomerOrder.id + '/status'), 'cancelled');
    }
    return () => clearInterval(timer);
  }, [myActiveCustomerOrder, countdown]);

  const handleProceedToVehicleConfig = () => {
    if (!streetAddress || !selectedDistrict || !selectedWard) { Alert.alert('Lỗi', 'Vui lòng điền đầy đủ địa chỉ!'); return; }
    setVehicleList([]); setCurrentConfigIndex(0);
    setTempBrand('Honda AirBlade'); setTempEngineOil(null); setTempGearOil(null);
    setBookingStep('vehicle_details');
  };

  const handleSaveCurrentVehicle = () => {
    if (!tempEngineOil && !tempGearOil) { Alert.alert('Lỗi', `Vui lòng chọn nhớt cho Xe ${currentConfigIndex + 1}!`); return; }
    let newVehicle = { id: currentConfigIndex + 1, brand: tempBrand, engineOil: tempEngineOil, gearOil: tempGearOil };
    const updatedList = [...vehicleList, newVehicle];
    setVehicleList(updatedList);

    if (currentConfigIndex + 1 < totalVehicles) {
      setCurrentConfigIndex(prev => prev + 1);
      setTempBrand('Honda AirBlade'); setTempEngineOil(null); setTempGearOil(null);
    } else {
      setBookingStep('checkout');
    }
  };

  const getCurrentFinalPrice = () => {
    let grossPrice = vehicleList.reduce((acc, v) => acc + (v.engineOil?.price||0) + (v.gearOil?.price||0) + LABOR_FEE, 0) + TRAVEL_FEE;
    let discountAmount = 0;
    if (selectedVoucher) discountAmount = grossPrice * (selectedVoucher.discountPercent / 100);
    const discountedSubtotal = grossPrice - discountAmount;
    return discountedSubtotal + (discountedSubtotal * TAX_RATE);
  };

  const executeOrderSubmission = () => {
    const fullAddress = `${detailAddress ? detailAddress + ' - ' : ''}${streetAddress}, ${selectedWard}, ${selectedDistrict}, TP.HCM`;
    
    let grossPrice = vehicleList.reduce((acc, v) => acc + (v.engineOil?.price||0) + (v.gearOil?.price||0) + LABOR_FEE, 0) + TRAVEL_FEE;
    let discountAmount = 0;
    if (selectedVoucher) {
      discountAmount = grossPrice * (selectedVoucher.discountPercent / 100);
      // TỰ ĐỘNG TRỪ SỐ LƯỢNG VOUCHER LÊN FIREBASE
      if (selectedVoucher.id) {
        set(ref(db, `vouchers/${selectedVoucher.id}/remaining`), selectedVoucher.remaining - 1);
      }
    }
    
    const finalPrice = getCurrentFinalPrice();
    const orderId = 'ORD_' + Math.floor(Math.random() * 10000);

    set(ref(db, 'orders/' + orderId), {
      id: orderId, customerName: currentUser?.name, customerPhone: currentUser?.phone,
      address: fullAddress, coord: selectedCoord, schedule: `${selectedDate.replace('\n', ' ')} lúc ${selectedTime}`,
      vehicles: vehicleList, grossPrice, discountAmount, finalPrice, paymentMethod,
      status: 'pending', staffPhone: null, staffName: null, staffPlate: null, staffCoord: null
    });
    setCountdown(300);
    setSelectedVoucher(null); // Reset voucher
    setBookingStep('booking_form');
    Alert.alert('Thành công', 'Đã đặt lịch thành công! Hệ thống đang tìm thợ gần nhất.');
  };

  const handleFinalSubmitOrder = () => {
    if (paymentMethod === 'online') {
      setShowQRPopup(true);
    } else {
      executeOrderSubmission();
    }
  };

  const pendingOrders = remoteOrders.filter(o => o.status === 'pending');
  const completedOrders = remoteOrders.filter(o => o.status === 'completed' && (o.customerPhone === currentUser?.phone || o.staffPhone === currentUser?.phone));

  const renderDropdownModal = (visible: boolean, setVisible: any, data: string[], onSelect: any, title: string) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={{maxHeight: 400}}>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          
          {/* 1. ĐĂNG NHẬP / ĐĂNG KÝ */}
          {!currentUser && (
            <View style={styles.authBox}>
              <View style={{alignItems: 'center', marginBottom: 20}}>
                <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/1973/1973940.png'}} style={styles.logoImage} resizeMode="contain" />
                <Text style={styles.mainLogo}>Thay Nhớt Tại Nhà</Text>
              </View>
              
              {/* Đã xóa tab Admin ở màn hình ngoài để bảo mật */}
              <View style={styles.roleTab}>
                <TouchableOpacity style={[styles.roleBtn, role === 'customer' && styles.activeRole]} onPress={() => setRole('customer')}><Text style={[styles.roleText, role === 'customer' && styles.activeText]}>Khách</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.roleBtn, role === 'staff' && styles.activeRole]} onPress={() => setRole('staff')}><Text style={[styles.roleText, role === 'staff' && styles.activeText]}>Thợ</Text></TouchableOpacity>
              </View>
              
              <View style={styles.modeToggle}>
                <TouchableOpacity onPress={() => setAuthMode('login')} style={[styles.modeBtn, authMode === 'login' && styles.activeMode]}><Text style={styles.modeText}>Đăng Nhập</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setAuthMode('register')} style={[styles.modeBtn, authMode === 'register' && styles.activeMode]}><Text style={styles.modeText}>Đăng Ký</Text></TouchableOpacity>
              </View>
              
              {authMode === 'register' && <TextInput style={styles.input} placeholder="Họ và tên" placeholderTextColor="#64748b" value={nameInput} onChangeText={setNameInput} />}
              <TextInput style={styles.input} placeholder="Số điện thoại" placeholderTextColor="#64748b" keyboardType="default" maxLength={15} value={phoneInput} onChangeText={setPhoneInput} />
              <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor="#64748b" secureTextEntry value={passwordInput} onChangeText={setPasswordInput} />
              
              {authMode === 'register' && role === 'staff' && (
                <>
                  <TextInput style={styles.input} placeholder="Số CCCD" placeholderTextColor="#64748b" keyboardType="numeric" value={cccdInput} onChangeText={setCccdInput} />
                  <TextInput style={styles.input} placeholder="Biển số xe" placeholderTextColor="#64748b" value={plateInput} onChangeText={setPlateInput} />
                </>
              )}

              <TouchableOpacity style={styles.mainBtn} onPress={handleAuthSubmit}><Text style={styles.mainBtnText}>{authMode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</Text></TouchableOpacity>
            </View>
          )}

          {/* 1.5 ADMIN DASHBOARD (BÍ MẬT) */}
          {currentUser && currentUser.role === 'admin' && (
            <View style={styles.dashboard}>
              <View style={styles.header}><Text style={styles.welcomeText}>👑 Quản Trị Hệ Thống (Admin)</Text><TouchableOpacity onPress={() => setCurrentUser(null)}><Text style={{color: '#ef4444', fontWeight: 'bold'}}>Đăng xuất</Text></TouchableOpacity></View>
              
              <View style={styles.card}>
                <Text style={styles.sectionHeading}>📊 Thống kê doanh thu toàn hệ thống</Text>
                <View style={{flexDirection: 'row', gap: 10, marginBottom: 15}}>
                  <View style={{flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 10}}>
                    <Text style={{color: '#94a3b8', fontSize: 11}}>Tổng đơn hoàn tất</Text>
                    <Text style={{color: '#38bdf8', fontSize: 20, fontWeight: 'bold'}}>{remoteOrders.filter(o => o.status === 'completed').length}</Text>
                  </View>
                  <View style={{flex: 1, backgroundColor: '#0f172a', padding: 12, borderRadius: 10}}>
                    <Text style={{color: '#94a3b8', fontSize: 11}}>Tổng doanh thu sàn</Text>
                    <Text style={{color: '#10b981', fontSize: 16, fontWeight: 'bold'}}>{remoteOrders.filter(o => o.status === 'completed').reduce((acc, o) => acc + (o.finalPrice || 0), 0).toLocaleString()}đ</Text>
                  </View>
                </View>

                {/* KHU VỰC TẠO VOUCHER */}
                <Text style={styles.sectionHeading}>🎟️ Quản lý & Tạo Voucher</Text>
                <View style={{backgroundColor: '#0f172a', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#334155'}}>
                   <TextInput style={styles.input} placeholder="Mã Code (VD: TET2024)" placeholderTextColor="#64748b" value={newVoucherCode} onChangeText={setNewVoucherCode} />
                   <TextInput style={styles.input} placeholder="% Giảm giá (VD: 10)" placeholderTextColor="#64748b" keyboardType="numeric" value={newVoucherDiscount} onChangeText={setNewVoucherDiscount} />
                   <TextInput style={styles.input} placeholder="Số lượng phát hành" placeholderTextColor="#64748b" keyboardType="numeric" value={newVoucherCount} onChangeText={setNewVoucherCount} />
                   <TouchableOpacity style={[styles.mainBtn, {backgroundColor: '#F97316'}]} onPress={handleCreateVoucher}><Text style={styles.mainBtnText}>PHÁT HÀNH VOUCHER</Text></TouchableOpacity>
                </View>
                
                {vouchers.map(v => (
                  <View key={v.id} style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: 10, marginBottom: 5, borderRadius: 5, borderWidth: 1, borderColor: '#334155'}}>
                     <Text style={{color: '#f8fafc', fontWeight: 'bold'}}>{v.code} - Giảm {v.discountPercent}%</Text>
                     <Text style={{color: v.remaining > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold'}}>Còn: {v.remaining} vé</Text>
                  </View>
                ))}

                <Text style={[styles.sectionHeading, {marginTop: 20}]}>📋 Quản lý toàn bộ đơn hàng trên sàn</Text>
                {remoteOrders.length === 0 && <Text style={styles.subText}>Chưa có đơn hàng nào trên hệ thống.</Text>}
                {remoteOrders.map((ord: any) => (
                  <View key={ord.id} style={[styles.jobCard, {borderLeftColor: ord.status === 'completed' ? '#10b981' : '#F97316'}]}>
                    <Text style={styles.jobTitle}>Mã: {ord.id} - Trạng thái: {ord.status.toUpperCase()}</Text>
                    <Text style={styles.jobDetail}>👤 Khách: {ord.customerName} ({ord.customerPhone})</Text>
                    <Text style={styles.jobDetail}>🏍️ Thợ: {ord.staffName || 'Chưa nhận'}</Text>
                    <Text style={styles.jobDetail}>📍 {ord.address}</Text>
                    <Text style={styles.jobPrice}>Thanh toán: {ord.finalPrice?.toLocaleString()}đ ({ord.paymentMethod === 'online' ? 'Chuyển khoản' : 'COD'})</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 2. KHÁCH HÀNG */}
          {currentUser && currentUser.role === 'customer' && (
            <View style={styles.dashboard}>
              <View style={styles.header}><Text style={styles.welcomeText}>Xin chào, {currentUser?.name}</Text></View>
              
              {currentTab === 'history' && (
                <View>
                  <Text style={styles.sectionHeading}>Lịch sử hóa đơn chi tiết</Text>
                  {completedOrders.length === 0 && <Text style={styles.subText}>Chưa có lịch sử.</Text>}
                  
                  {completedOrders.map((ord: any) => {
                    const isExpanded = expandedOrderId === ord.id;
                    return (
                      <TouchableOpacity key={ord.id} style={[styles.jobCard, isExpanded && {borderColor: '#10b981', borderWidth: 1}]} onPress={() => setExpandedOrderId(isExpanded ? null : ord.id)}>
                        <View style={styles.rowBetween}>
                          <Text style={styles.jobTitle}>Mã đơn: {ord.id}</Text>
                          <Text style={{color: '#38bdf8', fontWeight: 'bold'}}>{isExpanded ? '▲ Thu gọn' : '▼ Chi tiết'}</Text>
                        </View>
                        <Text style={styles.jobDetail}>Thợ phục vụ: {ord.staffName}</Text>
                        <Text style={styles.jobDetail}>📍 {ord.address}</Text>

                        {isExpanded ? (
                          <View style={{marginTop: 10, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10}}>
                            <Text style={{color: '#f8fafc', fontWeight: 'bold', marginBottom: 5}}>Chi tiết vật tư:</Text>
                            {ord.vehicles?.map((v: any, idx: number) => (
                              <View key={idx} style={{marginBottom: 6, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#38bdf8'}}>
                                <Text style={{color: '#e2e8f0', fontWeight: '600'}}>Xe {idx + 1}: {v.brand}</Text>
                                <Text style={{color: '#cbd5e1', fontSize: 12}}>- Nhớt máy: {v.engineOil?.name || 'Không'} ({v.engineOil?.price?.toLocaleString() || 0}đ)</Text>
                                {v.gearOil && <Text style={{color: '#cbd5e1', fontSize: 12}}>- Nhớt láp: {v.gearOil.name} ({v.gearOil.price.toLocaleString()}đ)</Text>}
                              </View>
                            ))}
                            <View style={{marginTop: 5, padding: 10, backgroundColor: '#0f172a', borderRadius: 8}}>
                              <Text style={{color: '#94a3b8', fontSize: 12}}>Hình thức: {ord.paymentMethod === 'online' ? 'Đã chuyển khoản QR' : 'Tiền mặt (COD)'}</Text>
                              <Text style={{color: '#94a3b8', fontSize: 12}}>Phí công thợ: {((ord.vehicles?.length || 1) * LABOR_FEE).toLocaleString()}đ</Text>
                              <Text style={{color: '#94a3b8', fontSize: 12}}>Phí di chuyển: {TRAVEL_FEE.toLocaleString()}đ</Text>
                              
                              {/* HIỂN THỊ RÕ RÀNG TIỀN ĐÃ GIẢM GIÁ */}
                              {ord.discountAmount > 0 && (
                                <Text style={{color: '#10b981', fontSize: 13, fontWeight: 'bold'}}>🎟️ Đã giảm giá Voucher: -{ord.discountAmount?.toLocaleString()}đ</Text>
                              )}
                              
                              <Text style={{color: '#f8fafc', fontWeight: 'bold', marginTop: 5}}>Tổng thanh toán cuối: {ord.finalPrice?.toLocaleString()}đ</Text>
                            </View>
                          </View>
                        ) : (
                          <Text style={styles.jobPrice}>Tổng tiền: {ord.finalPrice?.toLocaleString()}đ</Text>
                        )}

                        {ord.rating ? (
                          <Text style={{color: '#f59e0b', marginTop: 8, fontWeight: 'bold'}}>⭐ Bạn đã đánh giá: {ord.rating.stars} sao</Text>
                        ) : (
                          !isExpanded && (
                            <TouchableOpacity style={[styles.hugeBtn, {padding: 10, marginTop: 8}]} onPress={() => { setSelectedRatingOrder(ord); setShowRatingModal(true); }}>
                              <Text style={styles.hugeBtnText}>ĐÁNH GIÁ</Text>
                            </TouchableOpacity>
                          )
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {currentTab === 'home' && (
                <View>
                  {myActiveCustomerOrder ? (
                    <View style={styles.mapContainer}>
                      <MapView style={styles.mapViewStyle} initialRegion={{ latitude: myActiveCustomerOrder.coord?.latitude || 10.8038, longitude: myActiveCustomerOrder.coord?.longitude || 106.7126, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
                        <Marker coordinate={myActiveCustomerOrder.coord || { latitude: 10.8038, longitude: 106.7126 }} title="Địa điểm của bạn" pinColor="orange" />
                        {myActiveCustomerOrder.status !== 'pending' && <Marker coordinate={myActiveCustomerOrder.staffCoord || { latitude: 10.8100, longitude: 106.7180 }} title={`Thợ: ${myActiveCustomerOrder.staffName}`} pinColor="blue" />}
                      </MapView>
                      <View style={styles.mapBottomCard}>
                        {myActiveCustomerOrder.status === 'pending' ? (
                          <>
                            <Text style={styles.radarTitle}>Đang quét tìm thợ quanh bạn...</Text>
                            <Text style={styles.radarTimer}>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</Text>
                            <TouchableOpacity style={styles.cancelRadarBtn} onPress={() => set(ref(db, 'orders/' + myActiveCustomerOrder.id + '/status'), 'cancelled')}><Text style={styles.cancelRadarText}>Hủy tìm kiếm</Text></TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <Text style={styles.trackingTitle}>Trạng thái: {myActiveCustomerOrder.status.toUpperCase()}</Text>
                            <View style={styles.driverCard}>
                              <Text style={styles.driverText}>Thợ: {myActiveCustomerOrder.staffName} - Biển số: {myActiveCustomerOrder.staffPlate}</Text>
                              <View style={styles.row}>
                                <TouchableOpacity style={styles.callBtn} onPress={() => handleMakeCall(myActiveCustomerOrder.staffPhone)}><Text style={styles.btnText}>📞 Gọi thợ</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.chatBtn} onPress={() => setShowChatModal(true)}><Text style={styles.btnText}>💬 Chat</Text></TouchableOpacity>
                              </View>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View>
                      {bookingStep === 'booking_form' && (
                        <View style={styles.card}>
                          <View style={styles.bannerMock}><Text style={styles.bannerText}>📍 DỊCH VỤ THAY NHỚT TẠI NHÀ</Text></View>
                          
                          <TouchableOpacity style={styles.mapTriggerBox} onPress={() => setBookingStep('full_map')}>
                            <Text style={{fontSize: 22}}>🗺️</Text>
                            <View style={{flex: 1, marginLeft: 10}}>
                              <Text style={{color: '#94a3b8', fontSize: 11}}>Địa điểm trên bản đồ</Text>
                              <Text style={{color: '#38bdf8', fontWeight: 'bold', fontSize: 13}}>Tọa độ: {selectedCoord.latitude.toFixed(4)}, {selectedCoord.longitude.toFixed(4)}</Text>
                            </View>
                          </TouchableOpacity>

                          <Text style={styles.sectionHeading}>📍 Địa chỉ chi tiết</Text>
                          <View style={styles.row}>
                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowDistrictModal(true)}><Text style={styles.dropdownText}>{selectedDistrict || 'Chọn Quận/Huyện'}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => { if(!selectedDistrict) Alert.alert('Lỗi', 'Chọn Quận trước!'); else setShowWardModal(true); }}><Text style={styles.dropdownText}>{selectedWard || 'Chọn Phường/Xã'}</Text></TouchableOpacity>
                          </View>
                          {renderDropdownModal(showDistrictModal, setShowDistrictModal, Object.keys(HCM_DATA), (val: string) => { setSelectedDistrict(val); setSelectedWard(''); }, "Chọn Quận/Huyện (TP.HCM)")}
                          {renderDropdownModal(showWardModal, setShowWardModal, selectedDistrict ? HCM_DATA[selectedDistrict] : [], setSelectedWard, "Chọn Phường/Xã")}

                          <TextInput style={styles.input} placeholder="Tên đường..." placeholderTextColor="#64748b" value={streetAddress} onChangeText={setStreetAddress} />
                          <TextInput style={styles.input} placeholder="Số nhà, tòa nhà..." placeholderTextColor="#64748b" value={detailAddress} onChangeText={setDetailAddress} />

                          <Text style={styles.sectionHeading}>📅 Chọn ngày</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
                            {getDynamicDates().map((d: string) => (
                              <TouchableOpacity key={d} style={[styles.scrollDateBtn, selectedDate === d && styles.activeBgOrange]} onPress={() => setSelectedDate(d)}>
                                <Text style={[styles.scrollDateText, selectedDate === d && styles.activeTextW]}>{d}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>

                          <Text style={styles.sectionHeading}>⏰ Khung giờ</Text>
                          <View style={styles.gridWrap}>
                            {availableTimes.map((t: string) => (
                              <TouchableOpacity key={t} style={[styles.gridTimeBtn, selectedTime === t && styles.activeBgOrange]} onPress={() => setSelectedTime(t)}>
                                <Text style={[styles.gridTimeText, selectedTime === t && styles.activeTextW]}>{t}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>

                          <Text style={styles.sectionHeading}>🏍️ Số lượng xe</Text>
                          <View style={styles.row}>
                            {[1, 2, 3, 4].map((n: number) => (
                              <TouchableOpacity key={n} style={[styles.numBtn, totalVehicles === n && styles.activeRole]} onPress={() => { setTotalVehicles(n); setCustomVehicleCount(''); }}>
                                <Text style={[styles.numText, totalVehicles === n && styles.activeTextW]}>{n}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          <TextInput 
                            style={styles.input} placeholder="Hoặc nhập số lượng xe tùy ý..." placeholderTextColor="#64748b" keyboardType="numeric"
                            value={customVehicleCount} 
                            onChangeText={(val) => { setCustomVehicleCount(val); const parsed = parseInt(val); if (!isNaN(parsed) && parsed > 0) setTotalVehicles(parsed); }} 
                          />
                          <TouchableOpacity style={styles.hugeBtn} onPress={handleProceedToVehicleConfig}><Text style={styles.hugeBtnText}>TIẾP TỤC CHỌN NHỚT</Text></TouchableOpacity>
                        </View>
                      )}

                      {bookingStep === 'full_map' && (
                        <View style={[styles.card, {height: 500, padding: 0, overflow: 'hidden'}]}>
                          <MapView
                            style={{flex: 1}} showsUserLocation={true}
                            initialRegion={{ latitude: selectedCoord.latitude, longitude: selectedCoord.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                            onPress={(e) => setSelectedCoord(e.nativeEvent.coordinate)}
                          >
                            <Marker coordinate={selectedCoord} title="Vị trí phục vụ" pinColor="orange" />
                          </MapView>
                          <View style={{padding: 15, backgroundColor: '#1e293b'}}>
                            <Text style={{color: '#38bdf8', fontSize: 13, textAlign: 'center', marginBottom: 10}}>
                              📍 Đã ghim: {selectedCoord.latitude.toFixed(5)}, {selectedCoord.longitude.toFixed(5)}
                            </Text>
                            <TouchableOpacity style={styles.hugeBtn} onPress={() => setBookingStep('booking_form')}>
                              <Text style={styles.hugeBtnText}>XÁC NHẬN VỊ TRÍ NÀY</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {bookingStep === 'vehicle_details' && (
                        <View style={styles.card}>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                            <TouchableOpacity onPress={() => {
                              if (currentConfigIndex > 0) {
                                setCurrentConfigIndex(prev => prev - 1);
                                setVehicleList(prev => prev.slice(0, -1));
                              } else setBookingStep('booking_form');
                            }}>
                              <Text style={{color: '#38bdf8', fontWeight: 'bold'}}>❮ Quay lại</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepIndicator}>Cấu hình Xe {currentConfigIndex + 1} / {totalVehicles}</Text>
                            <TouchableOpacity onPress={() => setBookingStep('booking_form')}><Text style={{color: '#ef4444', fontWeight: 'bold'}}>Hủy</Text></TouchableOpacity>
                          </View>
                          <TextInput style={styles.input} value={tempBrand} onChangeText={setTempBrand} placeholder="Nhập Hãng/Dòng xe..." placeholderTextColor="#64748b" />
                          <Text style={styles.label}>Nhớt Máy:</Text>
                          {ENGINE_OILS.map((oil: any) => (
                            <TouchableOpacity key={oil.id} style={[styles.oilOption, tempEngineOil?.id === oil.id && styles.selectedOil]} onPress={() => setTempEngineOil(tempEngineOil?.id === oil.id ? null : oil)}>
                              <Text style={styles.oilName}>{'🛢️ '} {oil.name}</Text><Text style={styles.oilPrice}>{oil.price.toLocaleString()}đ</Text>
                            </TouchableOpacity>
                          ))}
                          <Text style={styles.label}>Nhớt Láp/Hộp Số (Tùy chọn):</Text>
                          {GEAR_OILS.map((oil: any) => (
                            <TouchableOpacity key={oil.id} style={[styles.oilOption, tempGearOil?.id === oil.id && styles.selectedOil]} onPress={() => setTempGearOil(tempGearOil?.id === oil.id ? null : oil)}>
                              <Text style={styles.oilName}>{'⚙️ '} {oil.name}</Text><Text style={styles.oilPrice}>{oil.price.toLocaleString()}đ</Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity style={styles.hugeBtn} onPress={handleSaveCurrentVehicle}>
                            <Text style={styles.hugeBtnText}>{currentConfigIndex + 1 < totalVehicles ? 'LƯU & SANG XE TIẾP' : 'XEM HÓA ĐƠN & THANH TOÁN'}</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {bookingStep === 'checkout' && (
                        <View style={styles.card}>
                          <Text style={styles.sectionHeading}>🧾 HÓA ĐƠN CHI TIẾT DỊCH VỤ</Text>
                          {vehicleList.map((v, idx) => (
                            <View key={idx} style={{backgroundColor: '#0f172a', padding: 12, borderRadius: 10, marginBottom: 10}}>
                              <Text style={{color: '#38bdf8', fontWeight: 'bold'}}>Xe {idx + 1}: {v.brand}</Text>
                              <Text style={{color: '#cbd5e1', fontSize: 13}}>- Nhớt máy: {v.engineOil?.name || 'Không'} ({v.engineOil?.price.toLocaleString() || 0}đ)</Text>
                              {v.gearOil && <Text style={{color: '#cbd5e1', fontSize: 13}}>- Nhớt láp: {v.gearOil.name} ({v.gearOil.price.toLocaleString()}đ)</Text>}
                            </View>
                          ))}
                          <View style={{borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10, marginTop: 5}}>
                            <Text style={styles.jobDetail}>Phí công thợ ({totalVehicles} xe): {(LABOR_FEE * totalVehicles).toLocaleString()}đ</Text>
                            <Text style={styles.jobDetail}>Phí di chuyển tận nơi: {TRAVEL_FEE.toLocaleString()}đ</Text>
                            
                            <Text style={styles.sectionHeading}>💳 Phương thức thanh toán</Text>
                            <View style={styles.row}>
                              <TouchableOpacity style={[styles.dropdownBtn, paymentMethod === 'cod' && {borderColor: '#10b981', borderWidth: 2}]} onPress={() => setPaymentMethod('cod')}>
                                <Text style={{color: '#f8fafc', fontWeight: 'bold'}}>💵 Tiền mặt (COD)</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[styles.dropdownBtn, paymentMethod === 'online' && {borderColor: '#10b981', borderWidth: 2}]} onPress={() => setPaymentMethod('online')}>
                                <Text style={{color: '#38bdf8', fontWeight: 'bold'}}>📱 Chuyển khoản QR</Text>
                              </TouchableOpacity>
                            </View>

                            <Text style={styles.sectionHeading}>🎟️ Chọn Voucher Khuyến Mãi</Text>
                            {vouchers.map((v) => (
                              <TouchableOpacity 
                                key={v.id} style={[styles.voucherCard, selectedVoucher?.id === v.id && styles.selectedVoucher, (!v.active || v.remaining <= 0) && {opacity: 0.5}]}
                                onPress={() => {
                                  if (!v.active || v.remaining <= 0) { Alert.alert('Thông báo', 'Voucher này đã hết lượt sử dụng trong ngày hoặc không khả dụng!'); return; }
                                  setSelectedVoucher(selectedVoucher?.id === v.id ? null : v);
                                }}
                              >
                                <View style={{flex: 1}}><Text style={{color: '#f8fafc', fontWeight: 'bold'}}>{v.title}</Text><Text style={{color: '#94a3b8', fontSize: 11}}>Còn lại: {v.remaining} lượt hôm nay</Text></View>
                                <Text style={{color: v.active && v.remaining > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: 12}}>{v.active && v.remaining > 0 ? 'Khả dụng' : 'Hết lượt'}</Text>
                              </TouchableOpacity>
                            ))}
                            <TextInput style={[styles.input, {marginTop: 10}]} placeholder="Hoặc nhập mã code thủ công..." placeholderTextColor="#64748b" value={customPromoCode} onChangeText={setCustomPromoCode} />
                            
                            <View style={{marginTop: 10, backgroundColor: '#0f172a', padding: 12, borderRadius: 10}}>
                              {selectedVoucher && <Text style={{color: '#10b981', marginBottom: 4, fontWeight: 'bold'}}>🎟️ Đã áp dụng giảm giá ưu đãi!</Text>}
                              <Text style={styles.jobPrice}>Tổng thanh toán: {getCurrentFinalPrice().toLocaleString()}đ</Text>
                            </View>
                          </View>
                          
                          <View style={styles.row}>
                            <TouchableOpacity style={[styles.hugeBtn, {flex: 1, backgroundColor: '#38bdf8'}]} onPress={() => { setCurrentConfigIndex(totalVehicles - 1); setBookingStep('vehicle_details'); }}><Text style={styles.hugeBtnText}>❮ Sửa xe</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.hugeBtn, {flex: 1, backgroundColor: '#ef4444'}]} onPress={() => setBookingStep('booking_form')}><Text style={styles.hugeBtnText}>HỦY</Text></TouchableOpacity>
                          </View>
                          <TouchableOpacity style={[styles.hugeBtn, {backgroundColor: '#10b981'}]} onPress={handleFinalSubmitOrder}>
                            <Text style={styles.hugeBtnText}>{paymentMethod === 'online' ? 'QUÉT MÃ QR THANH TOÁN' : 'XÁC NHẬN ĐẶT LỊCH NGAY'}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* 3. THỢ */}
          {currentUser && currentUser.role === 'staff' && (
            <View style={styles.dashboard}>
              <View style={styles.header}><Text style={styles.welcomeText}>Thợ: {currentUser?.name}</Text></View>
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Trạng thái:</Text>
                  <TouchableOpacity style={[styles.shiftBtn, isWorking ? styles.endShift : styles.activeBgStaff]} onPress={() => setIsWorking(!isWorking)}>
                    <Text style={styles.btnText}>{isWorking ? 'TẮT ONLINE' : 'BẬT ONLINE'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.earningsBanner}>Thu nhập: {completedOrders.reduce((acc:any, o:any)=> acc + (o.grossPrice * 0.8), 0).toLocaleString()}đ</Text>
              </View>

              {currentTab === 'history' && (
                <View>
                  {completedOrders.length === 0 && <Text style={styles.subText}>Chưa có lịch sử nhận đơn.</Text>}
                  
                  {completedOrders.map((ord: any) => {
                    const isExpanded = expandedOrderId === ord.id;
                    return (
                      <TouchableOpacity key={ord.id} style={[styles.jobCard, isExpanded && {borderColor: '#10b981', borderWidth: 1}]} onPress={() => setExpandedOrderId(isExpanded ? null : ord.id)}>
                        <View style={styles.rowBetween}>
                          <Text style={styles.jobTitle}>Mã đơn: {ord.id}</Text>
                          <Text style={{color: '#38bdf8', fontWeight: 'bold'}}>{isExpanded ? '▲ Thu gọn' : '▼ Chi tiết'}</Text>
                        </View>
                        <Text style={styles.jobDetail}>Khách hàng: {ord.customerName}</Text>
                        <Text style={styles.jobDetail}>📍 {ord.address}</Text>

                        {isExpanded ? (
                          <View style={{marginTop: 10, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10}}>
                            <Text style={{color: '#f8fafc', fontWeight: 'bold', marginBottom: 5}}>Chi tiết xe đã làm:</Text>
                            {ord.vehicles?.map((v: any, idx: number) => (
                              <View key={idx} style={{marginBottom: 6, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#38bdf8'}}>
                                <Text style={{color: '#e2e8f0', fontWeight: '600'}}>Xe {idx + 1}: {v.brand}</Text>
                                <Text style={{color: '#cbd5e1', fontSize: 12}}>- Nhớt máy: {v.engineOil?.name || 'Không'} ({v.engineOil?.price?.toLocaleString() || 0}đ)</Text>
                                {v.gearOil && <Text style={{color: '#cbd5e1', fontSize: 12}}>- Nhớt láp: {v.gearOil.name} ({v.gearOil.price.toLocaleString()}đ)</Text>}
                              </View>
                            ))}
                            <View style={{marginTop: 5, padding: 10, backgroundColor: '#0f172a', borderRadius: 8}}>
                              <Text style={{color: '#94a3b8', fontSize: 12}}>Hình thức: {ord.paymentMethod === 'online' ? 'Đã chuyển khoản QR' : 'Tiền mặt (COD)'}</Text>
                              <Text style={{color: '#94a3b8', fontSize: 12}}>Phí công thu: {((ord.vehicles?.length || 1) * LABOR_FEE).toLocaleString()}đ</Text>
                              <Text style={{color: '#94a3b8', fontSize: 12}}>Phí di chuyển: {TRAVEL_FEE.toLocaleString()}đ</Text>
                              
                              {/* HIỂN THỊ RÕ RÀNG TIỀN ĐÃ GIẢM GIÁ */}
                              {ord.discountAmount > 0 && (
                                <Text style={{color: '#ef4444', fontSize: 13, fontWeight: 'bold'}}>🎟️ Khách dùng Voucher: -{ord.discountAmount?.toLocaleString()}đ</Text>
                              )}
                              
                              <Text style={{color: '#f8fafc', fontWeight: 'bold', marginTop: 5}}>Tổng tiền đã thanh toán: {ord.finalPrice?.toLocaleString()}đ</Text>
                              <Text style={{color: '#f59e0b', fontWeight: 'bold', marginTop: 5, fontSize: 14}}>💰 Số tiền thực nhận: {(ord.grossPrice * 0.8)?.toLocaleString()}đ</Text>
                            </View>
                          </View>
                        ) : (
                          <Text style={styles.jobPrice}>Nhận: {(ord.grossPrice * 0.8).toLocaleString()}đ</Text>
                        )}
                        {ord.rating && <Text style={{color: '#f59e0b', marginTop: 8, fontWeight: 'bold'}}>⭐ Đánh giá từ khách: {ord.rating.stars} sao</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {currentTab === 'home' && isWorking && (
                <View>
                  {!myActiveStaffOrder ? (
                    <View>
                      <Text style={styles.sectionHeading}>🚨 Đơn mới quanh đây:</Text>
                      {pendingOrders.map((ord: any) => (
                        <View key={ord.id} style={styles.incomingJobCard}>
                          <Text style={styles.incomingTitle}>ĐƠN MỚI!</Text>
                          <Text style={styles.jobDetail}>📍 Khách: {ord.customerName} - {ord.address}</Text>
                          <Text style={styles.jobDetail}>⏰ Lịch hẹn: {ord.schedule}</Text>
                          <Text style={styles.jobDetail}>💳 Hình thức: {ord.paymentMethod === 'online' ? 'Đã thanh toán Online (QR)' : 'Tiền mặt (COD)'}</Text>
                          <Text style={styles.jobPrice}>💰 Tổng tiền thu: {ord.finalPrice.toLocaleString()}đ</Text>
                          
                          <View style={{backgroundColor: '#0f172a', padding: 12, borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: '#334155'}}>
                            <Text style={{color: '#38bdf8', fontWeight: 'bold', marginBottom: 6}}>📋 Danh sách xe & vật tư cần chuẩn bị:</Text>
                            {ord.vehicles?.map((v: any, idx: number) => (
                              <View key={idx} style={{marginBottom: 6, borderBottomWidth: idx < ord.vehicles.length - 1 ? 1 : 0, borderBottomColor: '#1e293b', paddingBottom: 4}}>
                                <Text style={{color: '#f8fafc', fontWeight: '600'}}>Xe {idx + 1}: {v.brand}</Text>
                                <Text style={{color: '#cbd5e1', fontSize: 12}}>  - Nhớt máy: {v.engineOil?.name || 'Không'} ({v.engineOil?.price.toLocaleString() || 0}đ)</Text>
                                {v.gearOil && <Text style={{color: '#cbd5e1', fontSize: 12}}>  - Nhớt láp: {v.gearOil.name} ({v.gearOil.price.toLocaleString()}đ)</Text>}
                              </View>
                            ))}
                          </View>

                          <TouchableOpacity style={styles.hugeBtn} onPress={() => set(ref(db, `orders/${ord.id}`), { ...ord, status: 'preparing', staffPhone: currentUser?.phone, staffName: currentUser?.name, staffPlate: currentUser?.plate })}>
                            <Text style={styles.hugeBtnText}>NHẬN ĐƠN NGAY</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.mapContainer}>
                      <MapView style={styles.mapViewStyle} initialRegion={{ latitude: myActiveStaffOrder.coord?.latitude || 10.8038, longitude: myActiveStaffOrder.coord?.longitude || 106.7126, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
                        <Marker coordinate={myActiveStaffOrder.coord || { latitude: 10.8038, longitude: 106.7126 }} title="Điểm đến của khách" pinColor="orange" />
                        <Marker coordinate={currentLocation} title="Vị trí thực tế của bạn" pinColor="blue" />
                      </MapView>
                      
                      <ScrollView style={styles.mapBottomCardScroll} contentContainerStyle={{padding: 15}}>
                        <Text style={styles.trackingTitle}>Đơn: {myActiveStaffOrder.id} ({myActiveStaffOrder.status.toUpperCase()})</Text>
                        <Text style={styles.jobDetail}>Khách: {myActiveStaffOrder.customerName} ({myActiveStaffOrder.customerPhone})</Text>
                        <Text style={styles.jobDetail}>💳 Thanh toán: {myActiveStaffOrder.paymentMethod === 'online' ? 'Đã chuyển khoản trước' : 'Thu tiền mặt (COD)'}</Text>
                        <Text style={styles.jobDetail}>📍 Địa chỉ: {myActiveStaffOrder.address}</Text>

                        <View style={{backgroundColor: '#0f172a', padding: 12, borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: '#334155'}}>
                          <Text style={{color: '#38bdf8', fontWeight: 'bold', marginBottom: 6}}>📋 Danh sách xe & vật tư cần thay:</Text>
                          {myActiveStaffOrder.vehicles?.map((v: any, idx: number) => (
                            <View key={idx} style={{marginBottom: 6, borderBottomWidth: idx < myActiveStaffOrder.vehicles.length - 1 ? 1 : 0, borderBottomColor: '#1e293b', paddingBottom: 4}}>
                              <Text style={{color: '#f8fafc', fontWeight: '600'}}>Xe {idx + 1}: {v.brand}</Text>
                              <Text style={{color: '#cbd5e1', fontSize: 12}}>  - Nhớt máy: {v.engineOil?.name || 'Không'}</Text>
                              {v.gearOil && <Text style={{color: '#cbd5e1', fontSize: 12}}>  - Nhớt láp: {v.gearOil.name}</Text>}
                            </View>
                          ))}
                        </View>

                        <View style={styles.row}>
                          <TouchableOpacity style={styles.callBtn} onPress={() => handleMakeCall(myActiveStaffOrder.customerPhone)}><Text style={styles.btnText}>📞 Gọi</Text></TouchableOpacity>
                          <TouchableOpacity style={styles.chatBtn} onPress={() => setShowChatModal(true)}><Text style={styles.btnText}>💬 Chat</Text></TouchableOpacity>
                        </View>

                        {myActiveStaffOrder.status === 'preparing' && <TouchableOpacity style={styles.hugeBtn} onPress={() => set(ref(db, `orders/${myActiveStaffOrder.id}/status`), 'moving')}><Text style={styles.hugeBtnText}>BẮT ĐẦU DI CHUYỂN</Text></TouchableOpacity>}
                        {myActiveStaffOrder.status === 'moving' && <TouchableOpacity style={styles.hugeBtn} onPress={() => set(ref(db, `orders/${myActiveStaffOrder.id}/status`), 'arrived')}><Text style={styles.hugeBtnText}>ĐÃ ĐẾN NƠI</Text></TouchableOpacity>}
                        {myActiveStaffOrder.status === 'arrived' && (
                          <TouchableOpacity style={styles.hugeBtn} onPress={() => setStaffInvoiceOrder(myActiveStaffOrder)}>
                            <Text style={styles.hugeBtnText}>{myActiveStaffOrder.paymentMethod === 'online' ? 'XÁC NHẬN HOÀN TẤT' : 'THU TIỀN & HOÀN TẤT'}</Text>
                          </TouchableOpacity>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* 4. MÀN HÌNH TÔI (PROFILE) */}
          {currentUser && currentTab === 'profile' && (
            <View style={styles.dashboard}>
              <View style={styles.card}>
                <Text style={styles.sectionHeading}>👤 Thông tin tài khoản</Text>
                <Text style={styles.label}>Họ và tên</Text><TextInput style={styles.input} value={editName} onChangeText={setEditName} />
                <Text style={styles.label}>Số điện thoại</Text><TextInput style={[styles.input, {backgroundColor: '#0f172a', color: '#64748b'}]} value={currentUser?.phone} editable={false} />
                <Text style={styles.label}>Mật khẩu mới (tùy chọn)</Text><TextInput style={styles.input} placeholder="Nhập mật khẩu mới..." placeholderTextColor="#64748b" secureTextEntry value={editPassword} onChangeText={setEditPassword} />
                <TouchableOpacity style={styles.mainBtn} onPress={handleUpdateProfile}><Text style={styles.mainBtnText}>LƯU THAY ĐỔI</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.mainBtn, {backgroundColor: '#EF4444', marginTop: 15}]} onPress={() => setCurrentUser(null)}><Text style={styles.mainBtnText}>ĐĂNG XUẤT</Text></TouchableOpacity>
              </View>
            </View>
          )}

        </ScrollView>

        {/* MODAL QR THANH TOÁN TRỰC TUYẾN DYNAMIC */}
        <Modal visible={showQRPopup} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {alignItems: 'center'}]}>
              <Text style={styles.modalTitle}>📱 QUÉT MÃ QR THANH TOÁN</Text>
              <Text style={{color: '#cbd5e1', fontSize: 13, textAlign: 'center', marginBottom: 15}}>Sử dụng App Ngân hàng hoặc Ví điện tử để thanh toán</Text>
              
              <View style={{backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15}}>
                <Image 
                  source={{uri: `https://api.vietqr.io/image/970422-0381234567-G8499k8.jpg?accountName=NGUYEN%20GIA%20TIN&amount=${getCurrentFinalPrice()}&addInfo=ThayNhot%20${currentUser?.phone}`}} 
                  style={{width: 180, height: 180}} 
                  resizeMode="contain" 
                />
                <Text style={{textAlign: 'center', marginTop: 10, fontWeight: 'bold', color: '#0f172a'}}>Số tiền: {getCurrentFinalPrice().toLocaleString()}đ</Text>
              </View>

              <TouchableOpacity style={styles.hugeBtn} onPress={() => { setShowQRPopup(false); executeOrderSubmission(); }}>
                <Text style={styles.hugeBtnText}>ĐÃ CHUYỂN KHOẢN XONG</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.hugeBtn, {backgroundColor: '#475569', marginTop: 10}]} onPress={() => setShowQRPopup(false)}>
                <Text style={styles.hugeBtnText}>QUAY LẠI CHỌN LẠI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL CHAT */}
        <Modal visible={showChatModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {height: '70%', backgroundColor: '#1e293b'}]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 10}}>
                <Text style={styles.modalTitle}>💬 Khung Chat Trực Tuyến</Text><TouchableOpacity onPress={() => setShowChatModal(false)}><Text style={{color: '#ef4444', fontWeight: 'bold'}}>Đóng</Text></TouchableOpacity>
              </View>
              <ScrollView style={{flex: 1, marginVertical: 10}}>
                {chatMessages.map((msg, index) => (
                  <View key={index} style={{alignSelf: msg.senderPhone === currentUser?.phone ? 'flex-end' : 'flex-start', backgroundColor: msg.senderPhone === currentUser?.phone ? '#3b82f6' : '#334155', padding: 10, borderRadius: 8, marginVertical: 4, maxWidth: '80%'}}>
                    <Text style={{color: '#94a3b8', fontSize: 10}}>{msg.senderName} - {msg.time}</Text><Text style={{color: '#fff', fontSize: 14}}>{msg.text}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={{flexDirection: 'row', gap: 10}}>
                <TextInput style={[styles.input, {flex: 1, marginBottom: 0}]} placeholder="Nhập tin nhắn..." placeholderTextColor="#64748b" value={newMessageText} onChangeText={setNewMessageText} />
                <TouchableOpacity style={[styles.mainBtn, {marginTop: 0, justifyContent: 'center', paddingHorizontal: 20}]} onPress={handleSendMessage}><Text style={styles.mainBtnText}>Gửi</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL ĐÁNH GIÁ */}
        <Modal visible={showRatingModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>⭐ Đánh giá dịch vụ</Text>
              <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 15}}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRatingStars(star)}><Text style={{fontSize: 30}}>{star <= ratingStars ? '⭐' : '☆'}</Text></TouchableOpacity>
                ))}
              </View>
              <TextInput style={styles.input} placeholder="Nhận xét..." placeholderTextColor="#64748b" value={ratingComment} onChangeText={setRatingComment} />
              <TouchableOpacity style={styles.hugeBtn} onPress={() => {
                if (!selectedRatingOrder) { Alert.alert('Lỗi', 'Không tìm thấy thông tin đơn hàng!'); return; }
                set(ref(db, `orders/${selectedRatingOrder.id}/rating`), { stars: ratingStars, comment: ratingComment });
                setShowRatingModal(false); Alert.alert('Cảm ơn', 'Đánh giá đã được ghi nhận!');
              }}><Text style={styles.hugeBtnText}>GỬI ĐÁNH GIÁ</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL HÓA ĐƠN HOÀN THÀNH CHO THỢ */}
        <Modal visible={!!staffInvoiceOrder} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: '#1e293b'}]}>
              <Text style={styles.modalTitle}>🧾 HÓA ĐƠN HOÀN TẤT DỊCH VỤ</Text>
              {staffInvoiceOrder && (
                <View>
                  <Text style={styles.jobDetail}>Mã đơn: {staffInvoiceOrder.id}</Text>
                  <Text style={styles.jobDetail}>Khách hàng: {staffInvoiceOrder.customerName} ({staffInvoiceOrder.customerPhone})</Text>
                  <Text style={styles.jobDetail}>Hình thức: {staffInvoiceOrder.paymentMethod === 'online' ? 'Đã thanh toán Online trước' : 'Thu tiền mặt (COD)'}</Text>
                  <View style={{marginVertical: 10, backgroundColor: '#0f172a', padding: 10, borderRadius: 8}}>
                    <Text style={{color: '#38bdf8', fontWeight: 'bold', marginBottom: 5}}>Chi tiết vật tư xe:</Text>
                    {staffInvoiceOrder.vehicles?.map((v: any, idx: number) => (
                      <Text key={idx} style={{color: '#cbd5e1', fontSize: 12}}>- {v.brand}: {v.engineOil?.name || 'Không'} | {v.gearOil?.name || 'Không'}</Text>
                    ))}
                  </View>
                  <Text style={styles.jobDetail}>Tổng tiền: <Text style={{color: '#10b981', fontWeight: 'bold'}}>{staffInvoiceOrder.finalPrice?.toLocaleString()}đ</Text></Text>
                  <View style={{marginTop: 15, backgroundColor: '#0f172a', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#f59e0b'}}>
                    <Text style={{color: '#f59e0b', fontWeight: 'bold', fontSize: 15, textAlign: 'center'}}>💰 SỐ TIỀN THỢ NHẬN ĐƯỢC: {(staffInvoiceOrder.grossPrice * 0.8)?.toLocaleString()}đ</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity style={[styles.hugeBtn, {marginTop: 20}]} onPress={() => {
                set(ref(db, `orders/${staffInvoiceOrder.id}/status`), 'completed');
                setStaffInvoiceOrder(null); Alert.alert('Thành công', 'Đã đóng đơn hàng và cập nhật doanh thu!');
              }}><Text style={styles.hugeBtnText}>XÁC NHẬN & ĐÓNG ĐƠN</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {currentUser && currentUser.role !== 'admin' && (
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.bottomBtn} onPress={() => setCurrentTab('home')}><Text style={{fontSize: 22}}>🏠</Text><Text style={[styles.bottomText, currentTab === 'home' && styles.bottomTextActive]}>Trang chủ</Text></TouchableOpacity>
            <TouchableOpacity style={styles.bottomBtn} onPress={() => setCurrentTab('history')}><Text style={{fontSize: 22}}>🧾</Text><Text style={[styles.bottomText, currentTab === 'history' && styles.bottomTextActive]}>Lịch sử</Text></TouchableOpacity>
            <TouchableOpacity style={styles.bottomBtn} onPress={() => setCurrentTab('profile')}><Text style={{fontSize: 22}}>👤</Text><Text style={[styles.bottomText, currentTab === 'profile' && styles.bottomTextActive]}>Tôi</Text></TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapContainer: { width: '100%', height: 500, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
  mapViewStyle: { width: '100%', height: '45%' },
  mapBottomCard: { width: '100%', height: '55%', backgroundColor: '#1e293b', padding: 15 },
  mapBottomCardScroll: { width: '100%', height: '55%', backgroundColor: '#1e293b' },
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  contentContainer: { padding: 15, paddingBottom: 20 },
  authBox: { flex: 1, justifyContent: 'center', marginTop: 40 },
  logoImage: { width: 100, height: 100, borderRadius: 20, marginBottom: 10, alignSelf: 'center' },
  mainLogo: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center', marginBottom: 20 },
  roleTab: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 8, marginBottom: 15, padding: 4 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeRole: { backgroundColor: '#3b82f6' },
  roleText: { color: '#64748b', fontWeight: 'bold' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  modeToggle: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#334155', borderRadius: 6, padding: 3 },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 4 },
  activeMode: { backgroundColor: '#0f172a' },
  modeText: { color: '#cbd5e1', fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  mainBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  mainBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  dashboard: { flex: 1, marginTop: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  welcomeText: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#1e293b', padding: 18, borderRadius: 16, marginBottom: 15 },
  sectionHeading: { color: '#38bdf8', fontSize: 15, fontWeight: 'bold', marginTop: 5, marginBottom: 10 },
  label: { color: '#cbd5e1', fontSize: 13, marginBottom: 8, marginTop: 4, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownBtn: { flex: 1, backgroundColor: '#0f172a', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  dropdownText: { color: '#38bdf8', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  scrollDateBtn: { backgroundColor: '#0f172a', padding: 12, borderRadius: 12, marginRight: 10, minWidth: 80, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  scrollDateText: { color: '#cbd5e1', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  gridTimeBtn: { backgroundColor: '#0f172a', padding: 12, borderRadius: 10, width: '48%', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  gridTimeText: { color: '#cbd5e1', fontSize: 13, fontWeight: '600' },
  activeBgOrange: { backgroundColor: '#F97316', borderColor: '#F97316' },
  activeTextW: { color: '#FFFFFF' },
  numBtn: { flex: 1, backgroundColor: '#0f172a', padding: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  numText: { color: '#cbd5e1', fontWeight: 'bold' },
  hugeBtn: { backgroundColor: '#F97316', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  hugeBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  oilOption: { backgroundColor: '#0f172a', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'space-between' },
  selectedOil: { borderColor: '#F97316', borderWidth: 2, backgroundColor: '#1e293b' },
  oilName: { color: '#f8fafc', fontSize: 14, flex: 1, fontWeight: '600' },
  oilPrice: { color: '#F97316', fontWeight: 'bold' },
  stepIndicator: { color: '#F97316', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  bannerMock: { backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#F97316' },
  bannerText: { color: '#F97316', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  mapTriggerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
  voucherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  selectedVoucher: { borderColor: '#10b981', borderWidth: 2 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1e293b', paddingVertical: 15, paddingBottom: Platform.OS === 'ios' ? 25 : 15, borderTopWidth: 1, borderColor: '#334155', justifyContent: 'space-around' },
  bottomBtn: { alignItems: 'center' },
  bottomText: { color: '#64748b', fontWeight: '600', fontSize: 12 },
  bottomTextActive: { color: '#38bdf8', fontWeight: 'bold' },
  jobCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#38bdf8' },
  jobTitle: { color: '#f8fafc', fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  jobDetail: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, fontWeight: '500' },
  jobPrice: { color: '#10b981', fontWeight: 'bold', fontSize: 16, marginTop: 5 },
  shiftBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  endShift: { backgroundColor: '#ef4444' },
  activeBgStaff: { backgroundColor: '#10b981' },
  earningsBanner: { color: '#f59e0b', fontWeight: 'bold', fontSize: 15, marginTop: 15 },
  incomingJobCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F97316' },
  incomingTitle: { color: '#FCD34D', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  radarTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  radarTimer: { color: '#F97316', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  cancelRadarBtn: { backgroundColor: '#ef4444', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  cancelRadarText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  trackingTitle: { color: '#38bdf8', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  driverCard: { backgroundColor: '#0f172a', padding: 10, borderRadius: 10, width: '100%' },
  driverText: { color: '#f8fafc', marginBottom: 4, fontSize: 12, fontWeight: '600' },
  callBtn: { flex: 1, backgroundColor: '#3b82f6', padding: 8, alignItems: 'center', borderRadius: 6 },
  chatBtn: { flex: 1, backgroundColor: '#4A5568', padding: 8, alignItems: 'center', borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e293b', width: '100%', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  modalItemText: { color: '#f8fafc', fontSize: 15, textAlign: 'center', fontWeight: '600' },
  subText: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 10 }
});