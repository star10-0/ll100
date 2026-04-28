$(function () {
  // إظهار/إخفاء تفاصيل كل وجبة بشكل مستقل للسماح بعرض أكثر من تفاصيل بنفس الوقت.
  $(".details-btn").on("click", function () {
    const targetId = $(this).data("target");
    $("#" + targetId).toggle();
  });

  // عند الضغط على متابعة يجب اختيار وجبة واحدة على الأقل.
  $("#continueBtn").on("click", function () {
    const selectedCount = $(".meal-select:checked").length;

    if (selectedCount === 0) {
      $("#selectionError").text("يرجى اختيار وجبة واحدة على الأقل قبل المتابعة.");
      $("#orderSection").addClass("hidden");
      $("#resultBox").addClass("hidden").empty();
      return;
    }

    $("#selectionError").text("");
    $("#orderSection").removeClass("hidden");
  });

  // جمع الوجبات المحددة من الجدول مع السعر والاسم والرمز.
  function getSelectedMeals() {
    const selectedMeals = [];

    $(".meal-row").each(function () {
      const checkbox = $(this).find(".meal-select");
      if (checkbox.is(":checked")) {
        selectedMeals.push({
          code: $(this).data("code"),
          name: $(this).data("name"),
          price: Number($(this).data("price"))
        });
      }
    });

    return selectedMeals;
  }

  function clearErrors() {
    $("#nameError, #bankError, #dateError, #mobileError").text("");
  }

  // التحقق أن التاريخ بصيغة yyyy-mm-dd وأنه تاريخ حقيقي.
  function isValidDate(dateStr) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateStr)) {
      return false;
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  // التحقق من موبايلات سوريا (سيريتل/MTN) بصيغ 09xxxxxxxx أو 9639xxxxxxxx أو +9639xxxxxxxx
  function isValidSyrianMobile(number) {
    const compact = number.replace(/\s+/g, "");
    const regex = /^(?:\+963|963|0)(9(?:[3-6]|8|9)\d{7})$/;
    return regex.test(compact);
  }

  $("#orderForm").on("submit", function (event) {
    event.preventDefault();
    clearErrors();

    const fullName = $("#fullName").val().trim();
    const bankNumber = $("#bankNumber").val().trim();
    const orderDate = $("#orderDate").val().trim();
    const mobileNumber = $("#mobileNumber").val().trim();

    let isValid = true;

    // الاسم اختياري: عند الإدخال يجب أن يكون كلمتين إنجليزيتين مع فراغ واحد فقط.
    if (fullName !== "") {
      const nameRegex = /^[A-Za-z]+ [A-Za-z]+$/;
      if (!nameRegex.test(fullName)) {
        $("#nameError").text("الاسم الإنجليزي يجب أن يكون كلمتين بحروف إنجليزية وبينهما مسافة واحدة فقط.");
        isValid = false;
      }
    }

    // رقم الحساب البنكي إلزامي: 6 أرقام تمامًا (يسمح بالبدء بصفر).
    if (!/^\d{6}$/.test(bankNumber)) {
      $("#bankError").text("رقم الحساب البنكي مطلوب ويجب أن يتكون من 6 أرقام فقط.");
      isValid = false;
    }

    // التاريخ اختياري: عند الإدخال يجب أن يكون تاريخًا صحيحًا بصيغة yyyy-mm-dd.
    if (orderDate !== "" && !isValidDate(orderDate)) {
      $("#dateError").text("تاريخ الطلب غير صالح. استخدم الصيغة yyyy-mm-dd وأدخل تاريخًا حقيقيًا.");
      isValid = false;
    }

    // الموبايل اختياري: عند الإدخال يجب أن يطابق أنماط أرقام سيريتل أو MTN.
    if (mobileNumber !== "" && !isValidSyrianMobile(mobileNumber)) {
      $("#mobileError").text("رقم الموبايل غير صالح. استخدم 09xxxxxxxx أو 9639xxxxxxxx أو +9639xxxxxxxx.");
      isValid = false;
    }

    const selectedMeals = getSelectedMeals();
    if (selectedMeals.length === 0) {
      $("#selectionError").text("يجب اختيار وجبة واحدة على الأقل قبل إرسال الطلب.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    let total = 0;
    let mealsHtml = "<ul>";

    selectedMeals.forEach(function (meal) {
      total += meal.price;
      mealsHtml += `<li>${meal.code} - ${meal.name}: ${meal.price} ل.س</li>`;
    });

    mealsHtml += "</ul>";

    const tax = (total * 10) / 100;
    const finalAmount = total - tax;

    const summaryHtml = `
      <h3>ملخص الطلب</h3>
      <p><strong>الوجبات المختارة:</strong></p>
      ${mealsHtml}
      <p><strong>الإجمالي:</strong> ${total.toFixed(0)} ل.س</p>
      <p><strong>الضريبة (10%):</strong> ${tax.toFixed(0)} ل.س</p>
      <p><strong>الصافي بعد حسم الضريبة:</strong> ${finalAmount.toFixed(0)} ل.س</p>
    `;

    $("#resultBox").removeClass("hidden").html(summaryHtml);
  });
});
