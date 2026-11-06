# Лабораторна робота №2: Компоненти та пропси

## 1. Дерево рендерингу (Rendering Tree)

```text
App
├── Header
└── main
    ├── Card (title="Тімлід")
    │   ├── Avatar (size={120})
    │   └── p ("Андрій")
    └── Card (title="Команда")
        ├── Profile (key=1)
        │   ├── Avatar
        │   ├── h3 ("Андрій")
        │   └── p ("Тімлід, Fullstack")
        ├── Profile (key=2)
        │   ├── Avatar
        │   ├── h3 ("Микола")
        │   └── p ("Frontend Developer")
        ├── Profile (key=3)
        │   ├── Avatar
        │   ├── h3 ("Артем")
        │   └── p ("Backend Developer")
        ├── Profile (key=4)
        │   ├── Avatar
        │   ├── h3 ("Віталік")
        │   └── p ("UI/UX Designer")
        └── Profile (key=5)
            ├── Avatar
            ├── h3 ("Ярик")
            └── p ("QA Engineer")