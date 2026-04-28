$(document).ready(function () {
  const selectedMeals = {};

  function setAlert(message, isSuccess) {
    const alert = $('#selectionAlert');
    alert.text(message);
    alert.removeClass('alert-success alert-error');
    alert.addClass(isSuccess ? 'alert-success' : 'alert-error');
  }

  $('.toggle-details').on('click', function () {
    const target = $(this).data('target');
    $(target).toggle();
  });

  $('.meal-select').on('change', function () {
    const code = $(this).data('code');
    const name = $(this).data('name');
    const price = Number($(this).data('price'));

    if ($(this).is(':checked')) {
      selectedMeals[code] = { code, name, price };
    } else {
      delete selectedMeals[code];
    }
  });

  $('#continueBtn').on('click', function () {
    if (Object.keys(selectedMeals).length === 0) {
      $('#orderSection').addClass('hidden');
      setAlert('يرجى اختيار وجبة واحدة على الأقل قبل المتابعة.', false);
      return;
    }

    setAlert('تم حفظ الاختيارات. يمكنك الآن تعبئة نموذج الطلب.', true);
    $('#orderSection').removeClass('hidden');
  });

  function validateEnglishFullName(value) {
    if (value === '') return true;

    // السماح باسمين فقط باللغة الإنجليزية مع مسافة واحدة تماماً بينهما.
    const fullNameRegex = /^[A-Za-z]+ [A-Za-z]+$/;
    return fullNameRegex.test(value);
  }

  function validateOrderDate(value) {
    if (value === '') return true;

    // التأكد من الشكل yyyy-mm-dd أولاً.
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;

    // تحويل النص إلى تاريخ فعلي ثم التحقق أن القيم لم تتغير (لمنع تواريخ غير حقيقية).
    const dateObj = new Date(value + 'T00:00:00');
    if (Number.isNaN(dateObj.getTime())) return false;

    const [year, month, day] = value.split('-').map(Number);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() + 1 === month &&
      dateObj.getDate() === day
    );
  }

  function validateMobile(value) {
    if (value === '') return true;

    // صيغ شركات الموبايل السورية: 09 ثم أحد بادئات Syriatel/MTN ثم 7 أرقام.
    const mobileRegex = /^09(3|4|5|6|8|9)\d{7}$/;
    return mobileRegex.test(value);
  }

  $('#orderForm').on('submit', function (event) {
    event.preventDefault();

    const fullName = $('#fullName').val().trim();
    const bankAccount = $('#bankAccount').val().trim();
    const orderDate = $('#orderDate').val().trim();
    const mobileNumber = $('#mobileNumber').val().trim();

    let isValid = true;

    $('#fullNameError, #bankAccountError, #orderDateError, #mobileError').text('');

    if (!validateEnglishFullName(fullName)) {
      $('#fullNameError').text('الاسم الإنجليزي يجب أن يكون First Last بحروف إنجليزية ومسافة واحدة.');
      isValid = false;
    }

    // رقم الحساب مطلوب ويجب أن يكون ستة أرقام بالضبط (قد يبدأ بصفر).
    if (!/^\d{6}$/.test(bankAccount)) {
      $('#bankAccountError').text('رقم الحساب البنكي مطلوب ويجب أن يتكون من 6 أرقام فقط.');
      isValid = false;
    }

    if (!validateOrderDate(orderDate)) {
      $('#orderDateError').text('تاريخ الطلب يجب أن يكون صالحاً بالشكل yyyy-mm-dd.');
      isValid = false;
    }

    if (!validateMobile(mobileNumber)) {
      $('#mobileError').text('رقم الموبايل يجب أن يكون بصيغة سورية صحيحة (Syriatel أو MTN).');
      isValid = false;
    }

    if (Object.keys(selectedMeals).length === 0) {
      setAlert('لا يمكن الإرسال بدون اختيار وجبات.', false);
      isValid = false;
    }

    if (!isValid) {
      $('#resultSection').addClass('hidden').empty();
      return;
    }

    const mealsArray = Object.values(selectedMeals);
    const total = mealsArray.reduce((sum, meal) => sum + meal.price, 0);
    const tax = total * 0.1;
    const finalAfterDeduction = total - tax;

    const mealsListHtml = mealsArray
      .map((meal) => `<li>${meal.code} - ${meal.name}: ${meal.price.toLocaleString()} ل.س</li>`)
      .join('');

    const resultHtml = `
      <h2>ملخص الطلب</h2>
      <p><strong>الوجبات المختارة:</strong></p>
      <ul>${mealsListHtml}</ul>
      <p><strong>الإجمالي:</strong> ${total.toLocaleString()} ل.س</p>
      <p><strong>قيمة الضريبة (10%):</strong> ${tax.toLocaleString()} ل.س</p>
      <p><strong>المبلغ النهائي بعد حسم الضريبة:</strong> ${finalAfterDeduction.toLocaleString()} ل.س</p>
    `;

    $('#resultSection').html(resultHtml).removeClass('hidden');
    setAlert('تم إرسال الطلب بنجاح.', true);
  });
});
